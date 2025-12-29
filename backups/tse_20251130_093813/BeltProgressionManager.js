import pool from '../db/pool.js';
import LearningDatabase from './LearningDatabase.js';

class BeltProgressionManager {
    constructor(pool, learningDatabase) {
        this.pool = pool;
        this.learningDatabase = learningDatabase;
    }

    async updateProgressionFromEvaluation(characterId, evaluationResult) {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            const currentProgression = await client.query(
                'SELECT * FROM character_belt_progression WHERE character_id = $1',
                [characterId]
            );

            if (currentProgression.rows.length === 0) {
                throw new Error(`No belt progression found for character ${characterId}`);
            }

            const progression = currentProgression.rows[0];
            const score = evaluationResult.score;

            const updatedProgression = {
                total_tse_cycles: progression.total_tse_cycles + 1,
                successful_cycles: progression.successful_cycles + (score >= 0.7 ? 1 : 0),
                current_success_rate: ((progression.successful_cycles + (score >= 0.7 ? 1 : 0)) / (progression.total_tse_cycles + 1)).toFixed(4),
                last_evaluation_score: score
            };

            const advancementProgress = progression.advancement_progress || {};
            advancementProgress.cycles_completed = updatedProgression.total_tse_cycles;
            advancementProgress.last_score = score;

            await client.query(
                `UPDATE character_belt_progression 
                 SET total_tse_cycles = $1,
                     successful_cycles = $2,
                     current_success_rate = $3,
                     last_evaluation_score = $4,
                     advancement_progress = $5,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE character_id = $6`,
                [
                    updatedProgression.total_tse_cycles,
                    updatedProgression.successful_cycles,
                    updatedProgression.current_success_rate,
                    score,
                    JSON.stringify(advancementProgress),
                    characterId
                ]
            );

            console.log(`[Belt] Updated ${characterId}: Cycle ${updatedProgression.total_tse_cycles}, Score ${score}, Rate ${updatedProgression.current_success_rate}`);

            await client.query('COMMIT');

            return {
                character_id: characterId,
                cycles_completed: updatedProgression.total_tse_cycles,
                success_rate: updatedProgression.current_success_rate,
                last_score: score
            };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('BeltProgressionManager.updateProgressionFromEvaluation failed:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}

export default BeltProgressionManager;
