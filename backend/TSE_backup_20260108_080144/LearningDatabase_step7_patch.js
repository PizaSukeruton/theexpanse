// PATCH STEP 7 — DUPLICATE MERGE SYSTEM FOR KNOWLEDGE ITEMS
// This file replaces only the createCycle() function in LearningDatabase.js.
// Move this logic into the main file after review.

import generateHexId from "../utils/hexIdGenerator.js";
import { embedText, cosineSimilarity } from "./helpers/semanticUtils.js";
import traitManager from "../traits/TraitManager.js";
import pool from "../db/pool.js";

export async function createCycle_step7(acquired) {
    const { characterId, query, concept } = acquired;

    // (1) Build embedding
    const queryEmbedding = embedText(query);

    // (2) Normalize concept for duplicate matching
    const normalizedConcept = concept
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();

    // (3) Check if concept already exists (HIGH precision)
    const conceptRows = await pool.query(
        `SELECT * FROM knowledge_items WHERE LOWER(REPLACE(concept, ' ', '')) = $1`,
        [normalizedConcept]
    );

    if (conceptRows.rows.length > 0) {
        const existing = conceptRows.rows[0];

        // (3a) OPTIONALLY update semantic embedding (MERGE new info)
        try {
            const oldEmbedding = existing.semantic_embedding
                ? JSON.parse(existing.semantic_embedding)
                : null;

            let updatedEmbedding = queryEmbedding;
            if (oldEmbedding) {
                updatedEmbedding = oldEmbedding.map((x, i) => (x + queryEmbedding[i]) / 2);
            }

            await pool.query(
                `
                UPDATE knowledge_items
                SET semantic_embedding = $1,
                    complexity_score = LEAST(1, (complexity_score + 0.1))
                WHERE knowledge_id = $2
                `,
                [JSON.stringify(updatedEmbedding), existing.knowledge_id]
            );
        } catch (err) {
            console.error("[STEP7 MERGE EMBEDDING ERROR]", err.message);
        }

        // (3b) Return merged existing item instead of creating new
        return {
            status: "merged",
            merged_with: existing.knowledge_id,
            knowledge: {
                ...existing,
                merge_reason: "concept match",
                normalizedConcept
            }
        };
    }

    // (4) Domain detection (from step 6)
    const domainId = await this.detectDomain(query);

    // (5) Trait-aware complexity (from step 6)
    const complexity = await this.computeComplexity(characterId, query);

    // (6) Generate new hex ID
    const knowledgeId = await generateHexId("knowledge_item_id");

    // (7) Insert new item
    const insertSQL = `
        INSERT INTO knowledge_items
            (knowledge_id, content, semantic_embedding, domain_id, source_type,
             initial_character_id, initial_strength, complexity_score, concept)
        VALUES ($1,$2,$3,$4,'tse_cycle',$5,1,$6,$7)
        RETURNING *
    `;

    const result = await pool.query(insertSQL, [
        knowledgeId,
        query,
        JSON.stringify(queryEmbedding),
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

