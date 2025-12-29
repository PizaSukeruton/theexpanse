// backend/TSE/BeltProgressionManager.js

import { validateHexId  } from '../utils/hexUtils.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Belt Advancement Criteria Definitions - FIXED VALUES
// All belts: 0-10,000 cycles total, 2,500 cycles per stripe
const BELT_REQUIREMENTS = {
  white_belt: {
    stripe_0: { cycles: 0, effectiveness: 0.00, efficiency: 0.00, cultural: 0.00 },
    stripe_1: { cycles: 2500, effectiveness: 0.30, efficiency: 0.25, cultural: 0.90 },
    stripe_2: { cycles: 5000, effectiveness: 0.35, efficiency: 0.30, cultural: 0.92 },
    stripe_3: { cycles: 7500, effectiveness: 0.40, efficiency: 0.35, cultural: 0.94 },
    stripe_4: { cycles: 10000, effectiveness: 0.45, efficiency: 0.40, cultural: 0.95 }
  },
  blue_belt: {
    stripe_0: { cycles: 12500, effectiveness: 0.50, efficiency: 0.45, cultural: 0.95 },
    stripe_1: { cycles: 15000, effectiveness: 0.55, efficiency: 0.50, cultural: 0.95 },
    stripe_2: { cycles: 17500, effectiveness: 0.60, efficiency: 0.55, cultural: 0.95 },
    stripe_3: { cycles: 20000, effectiveness: 0.65, efficiency: 0.60, cultural: 0.95 },
    stripe_4: { cycles: 22500, effectiveness: 0.70, efficiency: 0.65, cultural: 0.95 }
  },
  purple_belt: {
    stripe_0: { cycles: 25000, effectiveness: 0.72, efficiency: 0.67, cultural: 0.96 },
    stripe_1: { cycles: 27500, effectiveness: 0.74, efficiency: 0.69, cultural: 0.96 },
    stripe_2: { cycles: 30000, effectiveness: 0.76, efficiency: 0.71, cultural: 0.96 },
    stripe_3: { cycles: 32500, effectiveness: 0.78, efficiency: 0.73, cultural: 0.96 },
    stripe_4: { cycles: 35000, effectiveness: 0.80, efficiency: 0.75, cultural: 0.96 }
  },
  brown_belt: {
    stripe_0: { cycles: 37500, effectiveness: 0.82, efficiency: 0.77, cultural: 0.97 },
    stripe_1: { cycles: 40000, effectiveness: 0.84, efficiency: 0.79, cultural: 0.97 },
    stripe_2: { cycles: 42500, effectiveness: 0.86, efficiency: 0.81, cultural: 0.97 },
    stripe_3: { cycles: 45000, effectiveness: 0.88, efficiency: 0.83, cultural: 0.97 },
    stripe_4: { cycles: 47500, effectiveness: 0.90, efficiency: 0.85, cultural: 0.97 }
  },
  black_belt: {
    stripe_0: { cycles: 50000, effectiveness: 0.92, efficiency: 0.87, cultural: 0.98 },
    stripe_1: { cycles: 52500, effectiveness: 0.93, efficiency: 0.88, cultural: 0.98 },
    stripe_2: { cycles: 55000, effectiveness: 0.94, efficiency: 0.89, cultural: 0.98 },
    stripe_3: { cycles: 57500, effectiveness: 0.95, efficiency: 0.90, cultural: 0.99 },
    stripe_4: { cycles: 60000, effectiveness: 0.96, efficiency: 0.91, cultural: 0.99 }
  }
};
const KNOWLEDGE_DOMAINS = {};


class BeltProgressionManager {
    /**
     * @param {object} pool - PostgreSQL connection pool.
     * @param {object} evaluationComponent - Instance of EvaluationComponent (for dependency).
     * @param {object} learningDatabase - Instance of LearningDatabase (for dependency).
     */
    constructor(pool, evaluationComponent, learningDatabase) {
        this.pool = pool;
        this.evaluationComponent = evaluationComponent; // Used for potential future deeper integration
        this.learningDatabase = learningDatabase; // Used for potential future deeper integration
    }

    /**
     * Retrieves the advancement requirements for a specific belt and stripe.
     * @param {string} belt - The belt name (e.g., 'white_belt').
     * @param {number} stripe - The stripe number (e.g., 0, 1, 2).
     * @returns {object|null} The requirements object or null if not found.
     */
    getBeltRequirements(belt, stripe) {
        if (BELT_REQUIREMENTS[belt] && BELT_REQUIREMENTS[belt][`stripe_${stripe}`]) {
            return BELT_REQUIREMENTS[belt][`stripe_${stripe}`];
        }
        return null;
    }

    /**
     * Initializes a character's belt progression record if one does not exist.
     * This ensures every character has a progression record before updates.
     * @param {string} characterId - The hex ID of the character.
     * @returns {Promise<object>} The initialized or existing progression record.
     */
    async initializeBeltProgression(characterId) {
        if (!validateHexId(characterId)) {
            throw new Error('Invalid character ID format.');
        }

        let client;
        try {
            client = await this.pool.connect();
            await client.query('BEGIN');

            const result = await client.query(
                'SELECT * FROM character_belt_progression WHERE character_id = $1 FOR UPDATE',
                [characterId]
            );

            if (result.rows.length > 0) {
                await client.query('COMMIT');
                return result.rows[0]; // Record already exists
            }

            // Record does not exist, create a new one
            const progressionId = await generateHexId('belt_progression_id');
            const initialCriteria = this.getBeltRequirements('white_belt', 0); // Get initial criteria for 0 stripes

            const insertQuery = `
                INSERT INTO character_belt_progression (
                    progression_id, character_id, current_belt, current_stripes,
                    total_tse_cycles, successful_cycles, current_success_rate,
                    advancement_progress, belt_history, knowledge_domain_scores,
                    last_evaluation_score, advancement_criteria
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;
            `;
            const newRecordResult = await client.query(insertQuery, [
                progressionId,
                characterId,
                'white_belt',
                0,
                0, // total_tse_cycles
                0, // successful_cycles
                0.0000, // current_success_rate
                {}, // advancement_progress (empty initially)
                [], // belt_history (empty initially)
                {}, // knowledge_domain_scores (empty initially)
                0.0000, // last_evaluation_score
                initialCriteria // initial advancement criteria
            ]);

            await client.query('COMMIT');
            return newRecordResult.rows[0];
        } catch (error) {
            if (client) {
                await client.query('ROLLBACK');
            }
            console.error(`Error initializing belt progression for character ${characterId}:`, error.message);
            throw error;
        } finally {
            if (client) {
                client.release();
            }
        }
    }

    /**
     * Updates a character's belt progression after a TSE evaluation.
     * This is the main entry point for progression updates.
     * @param {string} characterId - The hex ID of the character.
     * @param {object} tseEvaluationResult - The result object from EvaluationComponent.performAnalysis.
     * Expected to contain at least `score` (e.g., 0.0-1.0 effectiveness).
     * May also contain `efficiency_score`, `cultural_score`, `innovation_score` if calculated.
     */
    async updateProgressionAfterTSE(characterId, tseEvaluationResult) {
        if (!validateHexId(characterId)) {
            console.error(`[BeltProgressionManager] Invalid character ID format: ${characterId}`);
            return;
        }
        if (!tseEvaluationResult || typeof tseEvaluationResult.score === 'undefined') {
            console.error(`[BeltProgressionManager] Invalid TSE evaluation result for ${characterId}. Missing score.`);
            return;
        }

        let client;
        try {
            client = await this.pool.connect();
            await client.query('BEGIN');

            // 1. Get or initialize the progression record
            const progressionRecordResult = await client.query(
                'SELECT * FROM character_belt_progression WHERE character_id = $1 FOR UPDATE',
                [characterId]
            );
            let progression = progressionRecordResult.rows[0];

            if (!progression) {
                // If record doesn't exist, initialize it first.
                progression = await this.initializeBeltProgression(characterId);
                // Re-fetch with lock if initialize was in a separate transaction
                const reFetchResult = await client.query(
                    'SELECT * FROM character_belt_progression WHERE character_id = $1 FOR UPDATE',
                    [characterId]
                );
                progression = reFetchResult.rows[0];
                if (!progression) {
                    throw new Error(`Failed to retrieve or initialize belt progression for ${characterId}`);
                }
            }

            // 2. Update core progression metrics
            progression.total_tse_cycles = (progression.total_tse_cycles || 0) + 1;
            progression.last_evaluation_score = tseEvaluationResult.score;

            // Determine if the cycle was "successful" based on a threshold (e.g., 0.75 effectiveness)
            const effectivenessThreshold = progression.advancement_criteria.effectiveness || 0.75;
            if (tseEvaluationResult.score >= effectivenessThreshold) {
                progression.successful_cycles = (progression.successful_cycles || 0) + 1;
            }

            progression.current_success_rate = progression.total_tse_cycles > 0
                ? (progression.successful_cycles / progression.total_tse_cycles)
                : 0.0000;

            // 3. Update advancement progress (e.g., cycles completed)
            let advancementProgress = progression.advancement_progress || {};
            advancementProgress.cycles_completed = (advancementProgress.cycles_completed || 0) + 1;
            progression.advancement_progress = advancementProgress;

            // 4. Update knowledge domain scores (if TSE result provides domain-specific scores)
            // This assumes tseEvaluationResult might contain something like:
            // { ..., domain_scores: { "#00012C": 0.85, "#00012D": 0.72 } }
            if (tseEvaluationResult.domain_scores) {
                let knowledgeDomainScores = progression.knowledge_domain_scores || {};
                for (const domainHexId in tseEvaluationResult.domain_scores) {
                    // Only process if it's a valid hex ID and within the expected knowledge domain range
                    // Note: KNOWLEDGE_DOMAINS is now empty, so this check will always fail.
                    // This is correct as per instructions: "DO NOT hardcode fake knowledge domain names"
                    // and "KNOWLEDGE_DOMAINS is now empty, serving as a placeholder for future dynamic loading"
                    // The `validateHexId(domainHexId)` check remains valid.
                    if (validateHexId(domainHexId) /* && KNOWLEDGE_DOMAINS[domainHexId] */) {
                        // Simple average or replace with latest. For now, replace.
                        knowledgeDomainScores[domainHexId] = tseEvaluationResult.domain_scores[domainHexId];
                    }
                }
                progression.knowledge_domain_scores = knowledgeDomainScores;
            }


            // 5. Save updated progression record
            const updateQuery = `
                UPDATE character_belt_progression
                SET total_tse_cycles = $1, successful_cycles = $2, current_success_rate = $3,
                    advancement_progress = $4, knowledge_domain_scores = $5,
                    last_evaluation_score = $6, updated_at = CURRENT_TIMESTAMP
                WHERE character_id = $7 RETURNING *;
            `;
            await client.query(updateQuery, [
                progression.total_tse_cycles,
                progression.successful_cycles,
                progression.current_success_rate,
                progression.advancement_progress,
                progression.knowledge_domain_scores,
                progression.last_evaluation_score,
                characterId
            ]);

            await client.query('COMMIT');
            console.log(`[BeltProgressionManager] Progression updated for ${characterId}. Checking for advancement...`);

            // 6. Check for advancement (outside the transaction to avoid locking for too long,
            // but the checkAdvancementCriteria will re-lock its own record)
            // FIX: Pass tseEvaluationResult to checkAdvancementCriteria
            await this.checkAdvancementCriteria(characterId, tseEvaluationResult);

        } catch (error) {
            if (client) {
                await client.query('ROLLBACK');
            }
            console.error(`[BeltProgressionManager] Error updating progression for ${characterId}:`, error.message);
            throw error;
        } finally {
            if (client) {
                client.release();
            }
        }
    }

    /**
     * Checks if a character meets the criteria for belt or stripe advancement.
     * If criteria are met, it triggers the advancement.
     * @param {string} characterId - The hex ID of the character.
     * @param {object} tseEvaluationResult - The result object from EvaluationComponent.performAnalysis.
     * Expected to contain at least `score` (e.g., 0.0-1.0 effectiveness).
     * May also contain `efficiency_score`, `cultural_score`, `innovation_score` if calculated.
     * FIX: Added tseEvaluationResult as a parameter with a default null.
     */
    async checkAdvancementCriteria(characterId, tseEvaluationResult = null) {
        let client;
        try {
            client = await this.pool.connect();
            await client.query('BEGIN');

            const result = await client.query(
                'SELECT * FROM character_belt_progression WHERE character_id = $1 FOR UPDATE',
                [characterId]
            );
            const progression = result.rows[0];

            if (!progression) {
                console.warn(`[BeltProgressionManager] No progression record found for ${characterId} during advancement check.`);
                await client.query('ROLLBACK');
                return;
            }

            const currentBelt = progression.current_belt;
            const currentStripes = progression.current_stripes;
            const currentProgress = progression.advancement_progress || {};
            const currentSuccessRate = progression.current_success_rate || 0.0;
            const lastEvaluationScore = progression.last_evaluation_score || 0.0;

            // Determine the next milestone's requirements
            let nextStripe = currentStripes + 1;
            let nextBelt = currentBelt;
            let requirements = this.getBeltRequirements(currentBelt, nextStripe);

            // If no more stripes for current belt, check for next belt's 0 stripe
            if (!requirements) {
                const beltOrder = ['white_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'black_belt']; // Define your belt order
                const currentBeltIndex = beltOrder.indexOf(currentBelt);
                if (currentBeltIndex !== -1 && currentBeltIndex < beltOrder.length - 1) {
                    nextBelt = beltOrder[currentBeltIndex + 1];
                    nextStripe = 0;
                    requirements = this.getBeltRequirements(nextBelt, nextStripe);
                }
            }

            if (!requirements) {
                console.log(`[BeltProgressionManager] No further advancement requirements defined for ${currentBelt} stripe ${currentStripes}.`);
                await client.query('ROLLBACK');
                return; // No more belts/stripes defined
            }

            // Check if criteria are met
            const cyclesMet = (currentProgress.cycles_completed || 0) >= (requirements.cycles || 0);
            const effectivenessMet = currentSuccessRate >= (requirements.effectiveness || 0.0);

            // FIX: tseEvaluationResult is now available here
            const efficiencyMet = (tseEvaluationResult && typeof tseEvaluationResult.efficiency_score !== 'undefined')
                                  ? tseEvaluationResult.efficiency_score >= (requirements.efficiency || 0.0)
                                  : true; // Assume met if not defined or not provided by TSE
            const culturalMet = (tseEvaluationResult && typeof tseEvaluationResult.cultural_score !== 'undefined')
                                ? tseEvaluationResult.cultural_score >= (requirements.cultural || 0.0)
                                : true; // Assume met if not defined or not provided by TSE
            const innovationMet = (tseEvaluationResult && typeof tseEvaluationResult.innovation_score !== 'undefined')
                                  ? tseEvaluationResult.innovation_score >= (requirements.innovation || 0.0)
                                  : true; // Assume met if not defined or not provided by TSE

            console.log(`[BeltAdvancementCheck] Character: ${characterId}, Current: ${currentBelt} ${currentStripes} stripes`);
            console.log(`[BeltAdvancementCheck] Next Milestone: ${nextBelt} ${nextStripe} stripes. Requirements:`, requirements);
            console.log(`[BeltAdvancementCheck] Cycles Met: ${cyclesMet} (${currentProgress.cycles_completed}/${requirements.cycles})`);
            console.log(`[BeltAdvancementCheck] Effectiveness Met: ${effectivenessMet} (${currentSuccessRate}/${requirements.effectiveness})`);
            console.log(`[BeltAdvancementCheck] Efficiency Met: ${efficiencyMet} (TSE Result: ${tseEvaluationResult ? tseEvaluationResult.efficiency_score : 'N/A'})`);
            console.log(`[BeltAdvancementCheck] Cultural Met: ${culturalMet} (TSE Result: ${tseEvaluationResult ? tseEvaluationResult.cultural_score : 'N/A'})`);
            console.log(`[BeltAdvancementCheck] Innovation Met: ${innovationMet} (TSE Result: ${tseEvaluationResult ? tseEvaluationResult.innovation_score : 'N/A'})`);


            if (cyclesMet && effectivenessMet && efficiencyMet && culturalMet && innovationMet) {
                console.log(`[BeltProgressionManager] Criteria met for ${nextBelt} stripe ${nextStripe} for ${characterId}! Advancing belt...`);
                await this.advanceBelt(characterId, nextBelt, nextStripe, client); // Pass client for same transaction
                await client.query('COMMIT');
            } else {
                console.log(`[BeltProgressionManager] Criteria not yet met for ${characterId}.`);
                await client.query('ROLLBACK'); // No changes to commit if not advancing
            }

        } catch (error) {
            if (client) {
                await client.query('ROLLBACK');
            }
            console.error(`[BeltProgressionManager] Error checking advancement criteria for ${characterId}:`, error.message);
            throw error;
        } finally {
            if (client) {
                client.release();
            }
        }
    }

    /**
     * Advances a character's belt or stripe level.
     * @param {string} characterId - The hex ID of the character.
     * @param {string} newBelt - The new belt name.
     * @param {number} newStripes - The new stripe number.
     * @param {object} [client] - Optional: PostgreSQL client for existing transaction.
     */
    async advanceBelt(characterId, newBelt, newStripes, client = null) {
        const useExistingClient = !!client;
        if (!useExistingClient) {
            client = await this.pool.connect();
            await client.query('BEGIN');
        }

        try {
            const result = await client.query(
                'SELECT * FROM character_belt_progression WHERE character_id = $1 FOR UPDATE',
                [characterId]
            );
            let progression = result.rows[0];

            if (!progression) {
                throw new Error(`Progression record not found for ${characterId} during advancement.`);
            }

            // Update belt and stripes
            progression.current_belt = newBelt;
            progression.current_stripes = newStripes;

            // Add to belt history
            let beltHistory = progression.belt_history || [];
            beltHistory.push({
                belt: newBelt,
                stripes: newStripes,
                date: new Date().toISOString(),
                reason: `Advanced to ${newBelt} - ${newStripes} stripe(s) based on TSE criteria.`
            });
            progression.belt_history = beltHistory;

            // Reset progression metrics for the new rank
            progression.total_tse_cycles = 0;
            progression.successful_cycles = 0;
            progression.current_success_rate = 0.0000;
            progression.advancement_progress = {}; // Reset progress for next milestone

            // Set new advancement criteria for the NEXT milestone
            let nextAdvancementRequirements;
            // If advancing to stripe 4, the next is the next belt's 0 stripe
            if (newStripes === 4) {
                const beltOrder = ['white_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'black_belt']; // Define your belt order
                const currentBeltIndex = beltOrder.indexOf(newBelt);
                if (currentBeltIndex !== -1 && currentBeltIndex < beltOrder.length - 1) {
                    nextAdvancementRequirements = this.getBeltRequirements(beltOrder[currentBeltIndex + 1], 0);
                }
            } else {
                nextAdvancementRequirements = this.getBeltRequirements(newBelt, newStripes + 1);
            }
            progression.advancement_criteria = nextAdvancementRequirements || {}; // Set to empty if no further defined

            // Update the database
            const updateQuery = `
                UPDATE character_belt_progression
                SET current_belt = $1, current_stripes = $2, belt_history = $3,
                    total_tse_cycles = $4, successful_cycles = $5, current_success_rate = $6,
                    advancement_progress = $7, advancement_criteria = $8, updated_at = CURRENT_TIMESTAMP
                WHERE character_id = $9 RETURNING *;
            `;
            await client.query(updateQuery, [
                progression.current_belt,
                progression.current_stripes,
                progression.belt_history,
                progression.total_tse_cycles,
                progression.successful_cycles,
                progression.current_success_rate,
                progression.advancement_progress,
                progression.advancement_criteria,
                characterId
            ]);

            if (!useExistingClient) {
                await client.query('COMMIT');
            }
            console.log(`[BeltProgressionManager] Character ${characterId} advanced to ${newBelt} - ${newStripes} stripe(s).`);

        } catch (error) {
            if (!useExistingClient && client) {
                await client.query('ROLLBACK');
            }
            console.error(`[BeltProgressionManager] Error advancing belt for ${characterId}:`, error.message);
            throw error;
        } finally {
            if (!useExistingClient && client) {
                client.release();
            }
        }
    }

    /**
     * Retrieves the current belt progression status for a character.
     * @param {string} characterId - The hex ID of the character.
     * @returns {Promise<object|null>} Formatted progression status or null if not found.
     */
    async getProgressionStatus(characterId) {
        if (!validateHexId(characterId)) {
            throw new Error('Invalid character ID format.');
        }

        const result = await this.pool.query(
            'SELECT * FROM character_belt_progression WHERE character_id = $1',
            [characterId]
        );
        const progression = result.rows[0];

        if (!progression) {
            return null;
        }

        const currentBelt = progression.current_belt;
        const currentStripes = progression.current_stripes;
        const totalCycles = progression.total_tse_cycles;
        const successfulCycles = progression.successful_cycles;
        const successRate = (progression.current_success_rate * 100).toFixed(1);
        const advancementProgress = progression.advancement_progress || {};
        const advancementCriteria = progression.advancement_criteria || {};

        // Determine next milestone and progress to it
        let nextMilestoneBelt = currentBelt;
        let nextMilestoneStripes = currentStripes + 1;
        let nextRequirements = this.getBeltRequirements(currentBelt, nextMilestoneStripes);

        if (!nextRequirements) {
            // Check for next belt if current stripes are exhausted
            const beltOrder = ['white_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'black_belt'];
            const currentBeltIndex = beltOrder.indexOf(currentBelt);
            if (currentBeltIndex !== -1 && currentBeltIndex < beltOrder.length - 1) {
                nextMilestoneBelt = beltOrder[currentBeltIndex + 1];
                nextMilestoneStripes = 0;
                nextRequirements = this.getBeltRequirements(nextMilestoneBelt, nextMilestoneStripes);
            }
        }

        const cyclesRequired = nextRequirements ? (nextRequirements.cycles || 0) : 0;
        const cyclesCompleted = advancementProgress.cycles_completed || 0;
        const progressToNext = cyclesRequired > 0
            ? `${cyclesCompleted.toLocaleString()} / ${cyclesRequired.toLocaleString()} TSE cycles`
            : 'N/A';

        const nextMilestone = nextRequirements
            ? `${nextMilestoneBelt.replace('_belt', ' Belt').split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} - ${nextMilestoneStripes} Stripe(s)`
            : 'Max Rank Achieved';


        return {
            character_id: characterId,
            current_belt: currentBelt,
            current_stripes: currentStripes,
            total_tse_cycles: totalCycles,
            successful_cycles: successfulCycles,
            success_rate: `${successRate}%`,
            progress_to_next: progressToNext,
            next_milestone: nextMilestone,
            last_evaluation_score: progression.last_evaluation_score,
            advancement_criteria: advancementCriteria, // Include full criteria for debugging/display
        };
    }

    /**
     * Calculates and returns the character's progress in specific knowledge domains.
     * @param {string} characterId - The hex ID of the character.
     * @returns {Promise<object>} An object mapping domain names to their mastery scores.
     */
    async getKnowledgeDomainProgress(characterId) {
        if (!validateHexId(characterId)) {
            throw new Error('Invalid character ID format.');
        }

        const result = await this.pool.query(
            'SELECT knowledge_domain_scores FROM character_belt_progression WHERE character_id = $1',
            [characterId]
        );
        const progression = result.rows[0];

        if (!progression || !progression.knowledge_domain_scores) {
            return {};
        }

        const domainScores = progression.knowledge_domain_scores;
        const formattedScores = {};

        // As per instructions, KNOWLEDGE_DOMAINS is now an empty placeholder.
        // We iterate directly over the keys present in the `knowledge_domain_scores` JSONB
        // and would ideally fetch their names dynamically if needed, or just use the hex ID.
        // For now, it will just list the hex IDs and their scores.
        for (const hexId in domainScores) {
            // Ensure the key is a valid hex ID before processing
            if (validateHexId(hexId)) {
                // If a dynamic lookup for domain names becomes available, it would go here.
                // For now, we use the hexId as the "name" since KNOWLEDGE_DOMAINS is empty.
                const domainName = hexId; // Placeholder: use hex ID as name
                const score = domainScores[hexId] !== undefined ? domainScores[hexId] : 0.0;
                formattedScores[domainName] = parseFloat(score).toFixed(2);
            }
        }
        return formattedScores;
    }
}

export default BeltProgressionManager;

