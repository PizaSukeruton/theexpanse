import { ensureConcept } from "./helpers/ensureConcept.js";
import generateHexId from "../utils/hexIdGenerator.js";
import pool from "../db/pool.js";
import { embedText, cosineSimilarity } from "./helpers/semanticUtils.js";
import traitManager from "../traits/TraitManager.js"; // NEW

export default class LearningDatabase {
    constructor(dbPool) {
        this.pool = dbPool;
    }

    // ================================
    // STEP 5 — SEMANTIC REUSE (unchanged)
    // ================================
    async findSimilarKnowledge(characterId, queryEmbedding) {
        const sql = `
            SELECT knowledge_id, content, semantic_embedding
            FROM knowledge_items
            WHERE initial_character_id = $1
            AND semantic_embedding IS NOT NULL
        `;
        const result = await this.pool.query(sql, [characterId]);
        if (result.rows.length === 0) return null;

        let best = null;

        for (const row of result.rows) {
            try {
                const emb = JSON.parse(row.semantic_embedding);
                const score = cosineSimilarity(queryEmbedding, emb);
                if (!best || score > best.score) {
                    best = { score, knowledge_id: row.knowledge_id, content: row.content };
                }
            } catch {}
        }

        if (best && best.score >= 0.82) return best;
        return null;
    }

    // =====================================
    // STEP 6 — DOMAIN SELECTION + COMPLEXITY
    // =====================================
    async detectDomain(query) {
        const rows = await this.pool.query(`
            SELECT domain_id, domain_name
            FROM knowledge_domains
            WHERE is_active = TRUE
        `);

        const text = query.toLowerCase();
        const keywords = {
            story_basics: ["protagonist", "story", "plot", "goal", "conflict"],
            conversational: ["say", "speak", "respond", "dialogue"],
            system_docs: ["api", "server", "code", "module", "nlg"]
        };

        let best = null;

        for (const row of rows.rows) {
            const name = row.domain_name.toLowerCase();
            let score = 0;

            // keyword matching
            if (keywords.story_basics.some(k => text.includes(k)) && name.includes("story")) score += 0.7;
            if (keywords.conversational.some(k => text.includes(k)) && name.includes("convers")) score += 0.7;
            if (keywords.system_docs.some(k => text.includes(k)) && name.includes("system")) score += 0.7;

            if (!best || score > best.score) best = { score, domain: row.domain_id };
        }

        if (best && best.score > 0.6) return best.domain;

        // FINAL FALLBACK ORDER
        const fallbackOrder = ["#00012C", "#AE0001", "#AE0004"];
        for (const f of fallbackOrder) {
            if (rows.rows.find(r => r.domain_id === f)) return f;
        }

        return rows.rows[0]?.domain_id;
    }

    // trait-aware complexity
    async computeComplexity(characterId, query) {
        try {
            const traits = await traitManager.getTraitVector(characterId);

            const inquisitive = traits["#00005A"] || 50;   // example
            const overwhelmed = traits["#000012"] || 50;   // example

            let complexity =
                0.5 +
                (inquisitive - 50) * 0.005 -
                (overwhelmed - 50) * 0.003;

            return Math.max(0.1, Math.min(1.0, complexity));
        } catch {
            return 0.5; // fallback
        }
    }

    // ============================
    // STEP 1–6 CREATE CYCLE PIPELINE
    // ============================
    async createCycle(acquired) {
        const characterId = acquired.characterId;
        const query = acquired.query || acquired.content;
        const concept = acquired.concept || query;
        const safeConcept = ensureConcept(query, concept);

        console.log("------------------------------------------------");
        console.log("[DEBUG createCycle] acquired:", acquired);
        console.log("[DEBUG createCycle] query:", query);
        console.log("[DEBUG createCycle] concept:", safeConcept);
        console.log("[DEBUG createCycle] concept:", safeConcept);
        console.log("------------------------------------------------");


        // 🔧 Ensure concept is always valid

        // 🔧 PATCH: ensure concept is always safe

        // 1. embed
        const embedding = embedText(query);

        // 2. semantic reuse
        const reuse = await this.findSimilarKnowledge(characterId, embedding);
        if (reuse) {
            return {
                status: "reused",
                knowledge_id: reuse.knowledge_id,
                content: reuse.content,
                similarity: reuse.score
            };
        }

        // 3. domain detection (NEW)
        const domainId = await this.detectDomain(query);

        // 4. complexity score from traits (NEW)
        const complexity = await this.computeComplexity(characterId, query);

        // 5. generate ID
        const knowledgeId = await generateHexId("knowledge_item_id");

        // 6. insert
        const insertSQL = `
            INSERT INTO knowledge_items
                (knowledge_id, content, semantic_embedding, domain_id, source_type,
                initial_character_id, initial_strength, complexity_score, concept)
            VALUES ($1,$2,$3,$4,'tse_cycle',$5,1,$6,$7)
            RETURNING *
        `;

        const result = await this.pool.query(insertSQL, [
            knowledgeId,
            query,
            JSON.stringify(embedding),
            domainId,
            characterId,
            complexity,
            concept
        ]);

        return {
            status: "created",
            knowledge: result.rows[0]
        };
    }

    // ===================================
    // REVIEW — (unchanged)
    // ===================================
    async reviewKnowledge(characterId, knowledgeId, grade) {
        const reviewId = await generateHexId("tse_evaluation_record_id");

        const sql = `
            INSERT INTO knowledge_review_logs
                (log_id, character_id, knowledge_id, grade,
                 previous_interval, new_interval, retrievability_at_review)
            VALUES ($1,$2,$3,$4,1,1,1)
            RETURNING *
        `;

        const result = await this.pool.query(sql, [
            reviewId,
            characterId,
            knowledgeId,
            grade
        ]);

        return result.rows[0];
    }
}




// 🔧 PATCH: Ensure concept is ALWAYS valid before normalization


// ===============================
// ===============================


// ===== DEBUG PATCH: Log values inside createCycle() =====
console.log("------------------------------------------------");
console.log("------------------------------------------------");

