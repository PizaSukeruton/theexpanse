import pool from '../../db/pool.js';

export default class KnowledgeAcquisitionEngine {
    constructor() {
        console.log("[KnowledgeAcquisitionEngine] Initialized with JavaScript semantic search");
    }

    async acquire(characterId, query, extra = {}) {

        // 🔥 NEW: auto-repair undefined query
        const finalQuery =
              query ||
              extra.rawQuery ||
              extra.input ||
              extra.text ||
              "(missing query)";

        // 🔥 Hard fail guard
        if (!finalQuery || finalQuery.trim() === "") {
            throw new Error("KnowledgeAcquisitionEngine.acquire() received empty query");
        }

        // Simple deterministic concept extraction
        const concept = finalQuery
            .toLowerCase()
            .replace(/[^a-z0-9 ]/g, "")
            .split(" ")
            .slice(-1)[0];

        return {
            concept,
            domainId: extra.domainId || "#AE0001",    // default general domain for now
            content: finalQuery,
            sourceType: "tse_cycle"
        };
    }
}
