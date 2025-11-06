// backend/knowledge/KnowledgeAcquisitionEngine.js
// IMPROVED VERSION - Real keyword-based semantic search
// No Python chunker dependency - pure JavaScript implementation

import pool from '../db/pool.js';

class KnowledgeAcquisitionEngine {
    constructor() {
        this.initialized = false;
        
        // Common stop words to filter out
        this.stopWords = new Set([
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'will', 'with', 'what', 'when', 'where', 'who', 'how',
            'can', 'could', 'would', 'should', 'do', 'does', 'did', 'have',
            'had', 'been', 'being', 'am', 'are', 'were', 'you', 'your', 'me',
            'my', 'they', 'them', 'their', 'this', 'these', 'those'
        ]);
        
        console.log('[KnowledgeAcquisitionEngine] Initialized with keyword-based search');
    }

    async initialize() {
        try {
            // Test database connection
            const result = await pool.query('SELECT COUNT(*) FROM knowledge_items');
            const count = result.rows[0].count;
            console.log(`[KnowledgeAcquisitionEngine] Connected to knowledge base: ${count} items available`);
            this.initialized = true;
        } catch (error) {
            console.error('[KnowledgeAcquisitionEngine] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Extract meaningful keywords from a query
     * @param {string} query - The user's question or search query
     * @returns {string[]} Array of keywords
     */
    extractKeywords(query) {
        if (!query || typeof query !== 'string') {
            return [];
        }

        // Convert to lowercase and remove punctuation
        const cleaned = query.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .trim();

        // Split into words
        const words = cleaned.split(/\s+/);

        // Filter out stop words and short words
        const keywords = words.filter(word => 
            word.length > 2 && 
            !this.stopWords.has(word)
        );

        // Remove duplicates
        return [...new Set(keywords)];
    }

    /**
     * Calculate relevance score between query keywords and knowledge item
     * @param {string[]} keywords - Query keywords
     * @param {Object} item - Knowledge item from database
     * @returns {number} Relevance score (0-100)
     */
    calculateRelevance(keywords, item) {
        if (!keywords || keywords.length === 0) {
            return 0;
        }

        let score = 0;
        const searchText = `${item.title || ''} ${item.content || ''} ${item.domain || ''} ${(item.tags || []).join(' ')}`.toLowerCase();

        for (const keyword of keywords) {
            // Exact match in title: +30 points
            if (item.title && item.title.toLowerCase().includes(keyword)) {
                score += 30;
            }

            // Match in content: +10 points per occurrence (max 40)
            const contentMatches = (item.content || '').toLowerCase().split(keyword).length - 1;
            score += Math.min(contentMatches * 10, 40);

            // Match in domain: +15 points
            if (item.domain && item.domain.toLowerCase().includes(keyword)) {
                score += 15;
            }

            // Match in tags: +20 points
            if (item.tags && item.tags.some(tag => tag.toLowerCase().includes(keyword))) {
                score += 20;
            }
        }

        return Math.min(score, 100);
    }

    /**
     * Retrieve relevant knowledge based on query - REAL SEMANTIC SEARCH
     * @param {string} characterId - Character requesting knowledge
     * @param {string} query - The question or topic
     * @param {number} limit - Maximum number of items to return
     * @returns {Array} Relevant knowledge items sorted by relevance
     */
    async retrieveRelevantKnowledge(characterId, query, limit = 5) {
        try {
            console.log(`[KnowledgeAcquisitionEngine] Retrieving knowledge for: "${query}"`);

            // Extract keywords from query
            const keywords = this.extractKeywords(query);
            console.log(`[KnowledgeAcquisitionEngine] Extracted keywords:`, keywords);

            if (keywords.length === 0) {
                console.warn('[KnowledgeAcquisitionEngine] No keywords extracted, returning empty results');
                return [];
            }

            // Build PostgreSQL full-text search query
            // Search in title, content, domain, and tags
            const searchQuery = `
                SELECT 
                    item_id,
                    title,
                    content,
                    domain,
                    tags,
                    metadata,
                    source_attribution,
                    created_at
                FROM knowledge_items
                WHERE 
                    is_active = true
                    AND (
                        title ILIKE ANY($1::text[])
                        OR content ILIKE ANY($1::text[])
                        OR domain ILIKE ANY($1::text[])
                        OR tags::text ILIKE ANY($1::text[])
                    )
                ORDER BY created_at DESC
                LIMIT 20;
            `;

            // Create search patterns with wildcards
            const searchPatterns = keywords.map(kw => `%${kw}%`);

            const result = await pool.query(searchQuery, [searchPatterns]);

            console.log(`[KnowledgeAcquisitionEngine] Found ${result.rows.length} potential matches`);

            if (result.rows.length === 0) {
                console.log('[KnowledgeAcquisitionEngine] No matches found, attempting broader search...');
                
                // Fallback: Try single keyword search
                const fallbackQuery = `
                    SELECT 
                        item_id,
                        title,
                        content,
                        domain,
                        tags,
                        metadata,
                        source_attribution,
                        created_at
                    FROM knowledge_items
                    WHERE 
                        is_active = true
                        AND (
                            title ILIKE $1
                            OR content ILIKE $1
                            OR domain ILIKE $1
                        )
                    LIMIT 5;
                `;

                const broadResult = await pool.query(fallbackQuery, [`%${keywords[0]}%`]);
                console.log(`[KnowledgeAcquisitionEngine] Fallback search found ${broadResult.rows.length} items`);
                
                if (broadResult.rows.length === 0) {
                    return [];
                }

                return broadResult.rows.map(item => ({
                    ...item,
                    relevanceScore: 50,
                    matchType: 'fallback'
                }));
            }

            // Calculate relevance scores for each item
            const scoredItems = result.rows.map(item => ({
                ...item,
                relevanceScore: this.calculateRelevance(keywords, item),
                matchType: 'keyword'
            }));

            // Sort by relevance score (highest first)
            scoredItems.sort((a, b) => b.relevanceScore - a.relevanceScore);

            // Filter out items with score below threshold (20)
            const relevantItems = scoredItems.filter(item => item.relevanceScore >= 20);

            console.log(`[KnowledgeAcquisitionEngine] Returning ${Math.min(relevantItems.length, limit)} relevant items`);
            
            // Log top matches for debugging
            relevantItems.slice(0, 3).forEach((item, i) => {
                console.log(`  ${i + 1}. "${item.title}" (score: ${item.relevanceScore}, domain: ${item.domain})`);
            });

            // Return top N results
            return relevantItems.slice(0, limit);

        } catch (error) {
            console.error('[KnowledgeAcquisitionEngine] Error retrieving knowledge:', error);
            throw error;
        }
    }

    /**
     * Store new knowledge in character's knowledge state - REAL LEARNING
     * @param {string} characterId - Character learning the knowledge
     * @param {Object} knowledgeItem - Knowledge item to store
     * @param {Object} learningContext - Context of how it was learned
     * @returns {Object} Stored knowledge state entry
     */
    async ingestNewKnowledge(characterId, knowledgeItem, learningContext = {}) {
        try {
            console.log(`[KnowledgeAcquisitionEngine] Ingesting knowledge for ${characterId}: ${knowledgeItem.item_id || knowledgeItem.title}`);

            const client = await pool.connect();
            
            try {
                await client.query('BEGIN');

                // Check if character already knows this item
                const checkQuery = `
                    SELECT state_id, retrievability_score, last_reviewed_at
                    FROM character_knowledge_state
                    WHERE character_id = $1 AND knowledge_item_id = $2
                `;

                const existingState = await client.query(checkQuery, [
                    characterId,
                    knowledgeItem.item_id
                ]);

                let result;

                if (existingState.rows.length > 0) {
                    // Update existing knowledge (review)
                    const updateQuery = `
                        UPDATE character_knowledge_state
                        SET 
                            retrievability_score = LEAST(retrievability_score + 0.1, 1.0),
                            review_count = review_count + 1,
                            last_reviewed_at = NOW(),
                            next_review_at = NOW() + INTERVAL '1 day' * POW(2, review_count),
                            updated_at = NOW()
                        WHERE character_id = $1 AND knowledge_item_id = $2
                        RETURNING *;
                    `;

                    result = await client.query(updateQuery, [
                        characterId,
                        knowledgeItem.item_id
                    ]);

                    console.log(`[KnowledgeAcquisitionEngine] Updated knowledge state (review #${result.rows[0].review_count})`);

                } else {
                    // Insert new knowledge state
                    const insertQuery = `
                        INSERT INTO character_knowledge_state (
                            character_id,
                            knowledge_item_id,
                            retrievability_score,
                            review_count,
                            last_reviewed_at,
                            next_review_at,
                            learning_context
                        ) VALUES ($1, $2, $3, $4, NOW(), NOW() + INTERVAL '1 day', $5)
                        RETURNING *;
                    `;

                    result = await client.query(insertQuery, [
                        characterId,
                        knowledgeItem.item_id,
                        0.8, // Initial retrievability
                        1,   // First review
                        learningContext
                    ]);

                    console.log(`[KnowledgeAcquisitionEngine] Created new knowledge state`);
                }

                // Log the learning event
                const logQuery = `
                    INSERT INTO knowledge_review_logs (
                        character_id,
                        knowledge_item_id,
                        review_type,
                        performance_score,
                        review_context
                    ) VALUES ($1, $2, $3, $4, $5)
                    RETURNING *;
                `;

                await client.query(logQuery, [
                    characterId,
                    knowledgeItem.item_id,
                    'acquisition',
                    learningContext.performanceScore || 0.8,
                    learningContext
                ]);

                await client.query('COMMIT');

                console.log(`[KnowledgeAcquisitionEngine] ✅ Knowledge ingestion complete for ${characterId}`);

                return result.rows[0];

            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }

        } catch (error) {
            console.error('[KnowledgeAcquisitionEngine] Error ingesting knowledge:', error);
            throw error;
        }
    }

    /**
     * Get character's current knowledge state
     * @param {string} characterId - Character to query
     * @returns {Array} All knowledge items the character knows
     */
    async getCharacterKnowledge(characterId) {
        try {
            const query = `
                SELECT 
                    cks.*,
                    ki.title,
                    ki.content,
                    ki.domain,
                    ki.tags
                FROM character_knowledge_state cks
                JOIN knowledge_items ki ON cks.knowledge_item_id = ki.item_id
                WHERE cks.character_id = $1
                ORDER BY cks.retrievability_score DESC, cks.last_reviewed_at DESC;
            `;

            const result = await pool.query(query, [characterId]);
            
            console.log(`[KnowledgeAcquisitionEngine] Character ${characterId} knows ${result.rows.length} items`);
            
            return result.rows;

        } catch (error) {
            console.error('[KnowledgeAcquisitionEngine] Error getting character knowledge:', error);
            throw error;
        }
    }
}

export default KnowledgeAcquisitionEngine;
