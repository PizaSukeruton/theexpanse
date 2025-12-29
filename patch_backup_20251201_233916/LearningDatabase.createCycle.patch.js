// ============================
// PATCHED createCycle()
// ============================

async createCycle(acquired) {
    const { characterId, query, concept } = acquired;

    // 🔧 Ensure concept is always valid
    const safeConcept = ensureConcept(query, concept);

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

    // 3. domain detection
    const domainId = await this.detectDomain(query);

    // 4. complexity score from traits
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
        safeConcept
    ]);

    return {
        status: "created",
        knowledge: result.rows[0]
    };
}
