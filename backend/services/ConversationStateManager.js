import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

class ConversationStateManager {
    constructor() {
        this.SEQUENCE_POSITIONS = ['opening', 'first_topic', 'middle', 'pre_closing', 'closing'];
        this.MAX_QUD_DEPTH = 5;
    }

    async getOrCreateState(conversationId, userId) {
        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM conversation_states WHERE conversation_id = $1',
                [conversationId]
            );

            if (result.rows.length > 0) {
                return result.rows[0];
            }

            const stateId = await generateHexId('conversation_state_id');
            const insertResult = await client.query(`
                INSERT INTO conversation_states (state_id, conversation_id, user_id)
                VALUES ($1, $2, $3)
                RETURNING *
            `, [stateId, conversationId, userId]);

            console.log(`[ConversationStateManager] Created new state ${stateId} for conversation ${conversationId}`);
            return insertResult.rows[0];
        } finally {
            client.release();
        }
    }

    async pushQUD(conversationId, userId, qudData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const qudId = await generateHexId('qud_id');

            await client.query(`
                INSERT INTO conversation_qud (
                    qud_id, conversation_id, user_id, act_code, question_text,
                    speaker, topic, entities, turn_index, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'open')
            `, [
                qudId,
                conversationId,
                userId,
                qudData.actCode,
                qudData.questionText,
                qudData.speaker || 'user',
                qudData.topic || null,
                JSON.stringify(qudData.entities || []),
                qudData.turnIndex
            ]);

            const stateResult = await client.query(
                'SELECT qud_stack FROM conversation_states WHERE conversation_id = $1 FOR UPDATE',
                [conversationId]
            );

            // qudStack invariant: oldest at index 0, newest at end
            let qudStack = stateResult.rows[0]?.qud_stack || [];

            if (qudStack.length >= this.MAX_QUD_DEPTH) {
                const overflowId = qudStack[0];
                await this.mergeOverflowToSubQuestions(client, overflowId, qudStack.slice(1));
                qudStack = qudStack.slice(1);
            }

            qudStack.push(qudId);

            await client.query(`
                UPDATE conversation_states
                SET qud_stack = $1, current_topic = $2, updated_at = NOW()
                WHERE conversation_id = $3
            `, [JSON.stringify(qudStack), qudData.topic, conversationId]);

            await client.query('COMMIT');

            console.log(`[ConversationStateManager] Pushed QUD ${qudId} to stack (depth: ${qudStack.length})`);
            return qudId;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async mergeOverflowToSubQuestions(client, targetQudId, overflowIds) {
        if (overflowIds.length === 0) return;

        // FIX 1: Store objects with qud_id, not bare strings
        const subQuestionObjects = overflowIds.map(id => ({ qud_id: id }));

        await client.query(`
            UPDATE conversation_qud
            SET sub_questions = sub_questions || $1::jsonb
            WHERE qud_id = $2
        `, [JSON.stringify(subQuestionObjects), targetQudId]);

        console.log(`[ConversationStateManager] Merged ${overflowIds.length} overflow QUDs into ${targetQudId}`);
    }

    async resolveQUD(conversationId, qudId, resolutionData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(`
                UPDATE conversation_qud
                SET status = 'resolved',
                    resolution_type = $1,
                    resolved_by_act_id = $2,
                    resolution_summary = $3,
                    resolved_at = NOW()
                WHERE qud_id = $4
            `, [
                resolutionData.type || 'full',
                resolutionData.resolvedByActId || null,
                resolutionData.summary || null,
                qudId
            ]);

            const stateResult = await client.query(
                'SELECT qud_stack FROM conversation_states WHERE conversation_id = $1 FOR UPDATE',
                [conversationId]
            );

            // qudStack invariant: oldest at index 0, newest at end
            let qudStack = stateResult.rows[0]?.qud_stack || [];

            // FIX 2: Guard against resolving QUD not in stack
            if (!qudStack.includes(qudId)) {
                console.warn(`[ConversationStateManager] Resolving QUD not in stack: ${qudId}`);
            }

            qudStack = qudStack.filter(id => id !== qudId);

            await client.query(`
                UPDATE conversation_states
                SET qud_stack = $1, updated_at = NOW()
                WHERE conversation_id = $2
            `, [JSON.stringify(qudStack), conversationId]);

            await client.query('COMMIT');

            console.log(`[ConversationStateManager] Resolved QUD ${qudId} (type: ${resolutionData.type || 'full'})`);
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async abandonQUD(conversationId, qudId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // RECOMMENDATION 4: Set resolved_at for timing metrics
            await client.query(`
                UPDATE conversation_qud
                SET status = 'abandoned', resolved_at = NOW()
                WHERE qud_id = $1
            `, [qudId]);

            const stateResult = await client.query(
                'SELECT qud_stack FROM conversation_states WHERE conversation_id = $1 FOR UPDATE',
                [conversationId]
            );

            // qudStack invariant: oldest at index 0, newest at end
            let qudStack = stateResult.rows[0]?.qud_stack || [];
            qudStack = qudStack.filter(id => id !== qudId);

            await client.query(`
                UPDATE conversation_states
                SET qud_stack = $1, updated_at = NOW()
                WHERE conversation_id = $2
            `, [JSON.stringify(qudStack), conversationId]);

            await client.query('COMMIT');

            console.log(`[ConversationStateManager] Abandoned QUD ${qudId}`);
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getTopQUD(conversationId) {
        const result = await pool.query(
            'SELECT qud_stack FROM conversation_states WHERE conversation_id = $1',
            [conversationId]
        );

        // qudStack invariant: oldest at index 0, newest at end
        const qudStack = result.rows[0]?.qud_stack || [];
        if (qudStack.length === 0) return null;

        const topQudId = qudStack[qudStack.length - 1];

        const qudResult = await pool.query(
            'SELECT * FROM conversation_qud WHERE qud_id = $1',
            [topQudId]
        );

        return qudResult.rows[0] || null;
    }

    async getOpenQUDs(conversationId) {
        const result = await pool.query(`
            SELECT * FROM conversation_qud
            WHERE conversation_id = $1 AND status = 'open'
            ORDER BY turn_index ASC
        `, [conversationId]);

        return result.rows;
    }

    async updateSequencePosition(conversationId, newPosition) {
        if (!this.SEQUENCE_POSITIONS.includes(newPosition)) {
            throw new Error(`Invalid sequence position: ${newPosition}`);
        }

        await pool.query(`
            UPDATE conversation_states
            SET sequence_position = $1, updated_at = NOW()
            WHERE conversation_id = $2
        `, [newPosition, conversationId]);

        console.log(`[ConversationStateManager] Updated sequence position to: ${newPosition}`);
    }

    async setRepairInProgress(conversationId, repairType, repairSource) {
        await pool.query(`
            UPDATE conversation_states
            SET repair_in_progress = true,
                repair_type = $1,
                repair_source = $2,
                updated_at = NOW()
            WHERE conversation_id = $3
        `, [repairType, JSON.stringify(repairSource), conversationId]);

        console.log(`[ConversationStateManager] Repair started: ${repairType}`);
    }

    async clearRepair(conversationId) {
        await pool.query(`
            UPDATE conversation_states
            SET repair_in_progress = false,
                repair_type = NULL,
                repair_source = NULL,
                updated_at = NOW()
            WHERE conversation_id = $1
        `, [conversationId]);

        console.log(`[ConversationStateManager] Repair cleared`);
    }

    async addToCommonGround(conversationId, key, value) {
        await pool.query(`
            UPDATE conversation_states
            SET common_ground = common_ground || $1::jsonb,
                updated_at = NOW()
            WHERE conversation_id = $2
        `, [JSON.stringify({ [key]: value }), conversationId]);
    }

    async recordMove(conversationId, move) {
        // RECOMMENDATION 5: Use transaction with FOR UPDATE to prevent race conditions
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(
                'SELECT last_moves FROM conversation_states WHERE conversation_id = $1 FOR UPDATE',
                [conversationId]
            );

            let lastMoves = result.rows[0]?.last_moves || [];
            lastMoves.push({
                ...move,
                timestamp: new Date().toISOString()
            });

            if (lastMoves.length > 10) {
                lastMoves = lastMoves.slice(-10);
            }

            await client.query(`
                UPDATE conversation_states
                SET last_moves = $1, updated_at = NOW()
                WHERE conversation_id = $2
            `, [JSON.stringify(lastMoves), conversationId]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getState(conversationId) {
        const result = await pool.query(
            'SELECT * FROM conversation_states WHERE conversation_id = $1',
            [conversationId]
        );
        return result.rows[0] || null;
    }
}

export default new ConversationStateManager();
