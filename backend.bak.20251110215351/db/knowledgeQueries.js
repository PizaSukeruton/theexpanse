// backend/db/knowledgeQueries.js
// Database queries for knowledge system

import pool from './pool.js';

const knowledgeQueries = {
    // Insert new knowledge item
    async insertKnowledgeItem(data) {
        const query = `
            INSERT INTO knowledge_items (
                knowledge_id, content, domain_id, source_type, 
                initial_character_id, initial_strength, complexity_score
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const result = await pool.query(query, [
            data.knowledge_id,
            data.content,
            data.domain_id,
            data.source_type,
            data.initial_character_id,
            data.initial_strength,
            data.complexity_score
        ]);
        return result.rows[0];
    },

    // Get knowledge item by ID
    async getKnowledgeItem(knowledgeId) {
        const query = `SELECT * FROM knowledge_items WHERE knowledge_id = $1`;
        const result = await pool.query(query, [knowledgeId]);
        return result.rows[0];
    },

    // Upsert character knowledge state
    async upsertCharacterKnowledgeState(data) {
        const query = `
            INSERT INTO character_knowledge_state (
                character_id, knowledge_id, current_retrievability, 
                stability, difficulty, last_review_timestamp, 
                next_review_timestamp, acquisition_method, current_expertise_score
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (character_id, knowledge_id) 
            DO UPDATE SET
                current_retrievability = EXCLUDED.current_retrievability,
                stability = EXCLUDED.stability,
                difficulty = EXCLUDED.difficulty,
                last_review_timestamp = EXCLUDED.last_review_timestamp,
                next_review_timestamp = EXCLUDED.next_review_timestamp,
                current_expertise_score = EXCLUDED.current_expertise_score
            RETURNING *;
        `;
        const result = await pool.query(query, [
            data.character_id,
            data.knowledge_id,
            data.current_retrievability,
            data.stability,
            data.difficulty,
            data.last_review_timestamp,
            data.next_review_timestamp,
            data.acquisition_method,
            data.current_expertise_score
        ]);
        return result.rows[0];
    },

    // Get character's knowledge state
    async getCharacterKnowledgeState(characterId, limit = 10) {
        const query = `
            SELECT cks.*, ki.content, ki.domain_id
            FROM character_knowledge_state cks
            JOIN knowledge_items ki ON cks.knowledge_id = ki.knowledge_id
            WHERE cks.character_id = $1
            ORDER BY cks.current_retrievability DESC, cks.last_review_timestamp DESC
            LIMIT $2;
        `;
        const result = await pool.query(query, [characterId, limit]);
        return result.rows;
    },

    // Get single character knowledge state
    async getSingleCharacterKnowledgeState(characterId, knowledgeId) {
        const query = `
            SELECT * FROM character_knowledge_state 
            WHERE character_id = $1 AND knowledge_id = $2;
        `;
        const result = await pool.query(query, [characterId, knowledgeId]);
        return result.rows[0];
    },

    // Get character knowledge by domains
    async getCharacterKnowledgeByDomains(characterId, domainIds, limit = 5) {
        const query = `
            SELECT cks.*, ki.content, ki.domain_id
            FROM character_knowledge_state cks
            JOIN knowledge_items ki ON cks.knowledge_id = ki.knowledge_id
            WHERE cks.character_id = $1 AND ki.domain_id = ANY($2)
            ORDER BY cks.current_retrievability DESC
            LIMIT $3;
        `;
        const result = await pool.query(query, [characterId, domainIds, limit]);
        return result.rows;
    },

    // Update character knowledge retrievability
    async updateCharacterKnowledgeRetrievability(characterId, knowledgeId, retrievability) {
        const query = `
            UPDATE character_knowledge_state 
            SET current_retrievability = $3, last_review_timestamp = NOW()
            WHERE character_id = $1 AND knowledge_id = $2
            RETURNING *;
        `;
        const result = await pool.query(query, [characterId, knowledgeId, retrievability]);
        return result.rows[0];
    },

    // Update after review
    async updateCharacterKnowledgeStateAfterReview(data) {
        const query = `
            UPDATE character_knowledge_state 
            SET 
                current_retrievability = $3,
                stability = $4,
                difficulty = $5,
                last_review_timestamp = $6,
                next_review_timestamp = $7,
                is_forgotten = $8
            WHERE character_id = $1 AND knowledge_id = $2
            RETURNING *;
        `;
        const result = await pool.query(query, [
            data.character_id,
            data.knowledge_id,
            data.current_retrievability,
            data.stability,
            data.difficulty,
            data.last_review_timestamp,
            data.next_review_timestamp,
            data.is_forgotten
        ]);
        return result.rows[0];
    },

    // Mark knowledge as forgotten
    async markKnowledgeAsForgotten(characterId, knowledgeId, isForgotten) {
        const query = `
            UPDATE character_knowledge_state 
            SET is_forgotten = $3
            WHERE character_id = $1 AND knowledge_id = $2
            RETURNING *;
        `;
        const result = await pool.query(query, [characterId, knowledgeId, isForgotten]);
        return result.rows[0];
    },

    // Insert review log
    async insertKnowledgeReviewLog(data) {
        const query = `
            INSERT INTO knowledge_review_logs (
                log_id, character_id, knowledge_id, grade,
                previous_interval, new_interval, retrievability_at_review
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const result = await pool.query(query, [
            data.log_id,
            data.character_id,
            data.knowledge_id,
            data.grade,
            data.previous_interval,
            data.new_interval,
            data.retrievability_at_review
        ]);
        return result.rows[0];
    },

    // Insert transfer log
    async insertKnowledgeTransferLog(data) {
        const query = `
            INSERT INTO knowledge_transfer_logs (
                transfer_id, sender_character_id, receiver_character_id,
                knowledge_id, transfer_success_rate, transfer_quality_degradation,
                conversation_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const result = await pool.query(query, [
            data.transfer_id,
            data.sender_character_id,
            data.receiver_character_id,
            data.knowledge_id,
            data.transfer_success_rate,
            data.transfer_quality_degradation,
            data.conversation_id
        ]);
        return result.rows[0];
    },

    // Get or create knowledge domain
    async getKnowledgeDomainByName(domainName) {
        const query = `SELECT * FROM knowledge_domains WHERE domain_name = $1`;
        const result = await pool.query(query, [domainName]);
        return result.rows[0];
    },

    async insertKnowledgeDomain(data) {
        const query = `
            INSERT INTO knowledge_domains (domain_id, domain_name, description)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await pool.query(query, [
            data.domain_id,
            data.domain_name,
            data.description
        ]);
        return result.rows[0];
    },

    // Get character domain expertise
    async getCharacterDomainExpertise(characterId, domainId) {
        const query = `
            SELECT AVG(current_expertise_score) as expertise_level
            FROM character_knowledge_state cks
            JOIN knowledge_items ki ON cks.knowledge_id = ki.knowledge_id
            WHERE cks.character_id = $1 AND ki.domain_id = $2
            GROUP BY ki.domain_id;
        `;
        const result = await pool.query(query, [characterId, domainId]);
        return result.rows[0];
    },

    // Upsert character domain expertise (simplified - stores in knowledge_state)
    async upsertCharacterDomainExpertise(data) {
        // This updates the expertise scores for all knowledge in this domain
        const query = `
            UPDATE character_knowledge_state cks
            SET current_expertise_score = $3
            FROM knowledge_items ki
            WHERE cks.knowledge_id = ki.knowledge_id
            AND cks.character_id = $1
            AND ki.domain_id = $2;
        `;
        await pool.query(query, [
            data.character_id,
            data.domain_id,
            data.expertise_level
        ]);
        return { success: true };
    },

    // Get knowledge items due for review
    async getKnowledgeItemsDueForReview(currentTime) {
        const query = `
            SELECT * FROM character_knowledge_state
            WHERE next_review_timestamp <= $1
            ORDER BY next_review_timestamp ASC
            LIMIT 100;
        `;
        const result = await pool.query(query, [currentTime]);
        return result.rows;
    },

    // Update next review timestamp
    async updateCharacterKnowledgeNextReview(characterId, knowledgeId, nextReviewTimestamp) {
        const query = `
            UPDATE character_knowledge_state
            SET next_review_timestamp = $3
            WHERE character_id = $1 AND knowledge_id = $2
            RETURNING *;
        `;
        const result = await pool.query(query, [characterId, knowledgeId, nextReviewTimestamp]);
        return result.rows[0];
    }
};

export default knowledgeQueries;
