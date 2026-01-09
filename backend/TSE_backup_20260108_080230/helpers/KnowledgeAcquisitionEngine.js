import pool from "../../db/pool.js";

export default class KnowledgeAcquisitionEngine {
    constructor() {
        console.log("[KnowledgeAcquisitionEngine] Initialized with JavaScript semantic search");
    }

    // Step 1: Normalize concept
    normalizeConcept(text) {
        if (!text) return "";
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .replace(/\b(what|is|the|a|an|explain|define)\b/g, "")
            .trim();
    }

    // 🆕 Step 2: Look for existing knowledge
    async lookupExisting(concept) {
        if (!concept) return null;

        const query = `
            SELECT *
            FROM knowledge_items
            WHERE LOWER(concept) = LOWER($1)
               OR LOWER(content) LIKE '%' || LOWER($1) || '%'
            ORDER BY acquisition_timestamp DESC
            LIMIT 1
        `;

        const result = await pool.query(query, [concept]);
        return result.rows.length ? result.rows[0] : null;
    }

    async acquire(characterId, query) {
        const concept = this.normalizeConcept(query);

        // 1️⃣ First: try to find existing knowledge
        const existing = await this.lookupExisting(concept);
        if (existing) {
            return {
                ...existing,
                reused: true,
                characterId,
                knowledge_id: existing.knowledge_id
            };
        }

        // 2️⃣ Otherwise return acquisition package for new insertion
        return {
            characterId,
            concept,
            domainId: null,
            content: query,
            sourceType: "tse_cycle",
            reused: false
        };
    }
}
