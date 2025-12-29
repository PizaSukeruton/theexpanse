import pool from "../db/pool.js";
import generateHexId from "../utils/hexIdGenerator.js";

export default class LearningDatabase {

    constructor() {}

    async createCycle({ characterId, content, concept, domainId, sourceType }) {

        const knowledgeId = await generateHexId("knowledge_item_id");

        const insert = `
            INSERT INTO knowledge_items
            (knowledge_id, content, semantic_embedding, domain_id, source_type, initial_character_id, initial_strength, complexity_score, concept)
            VALUES ($1, $2, null, $3, $4, $5, 1, 0.5, $6)
            RETURNING *
        `;

        const result = await pool.query(insert, [
            knowledgeId,
            content,
            domainId,
            sourceType,
            characterId,
            concept
        ]);

        return result.rows[0];
    }
}
