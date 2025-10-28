// ================================================================================
// StudentComponent.js - Captures real-world user interaction outcomes.
// Task 12/61 Update: Added recordChatOutcome method.
// Epic Update: JSONB-Compatible Dual Chunker Integration with Strict Separation
// ngrok Test: Updated Conversational Chunker URL for live testing
// ================================================================================

import pkg from 'pg';
const { Pool  } = pkg;

class StudentComponent {
    constructor(pool) {
        if (!pool) {
            throw new Error("StudentComponent requires a database pool.");
        }
        this.pool = pool;
        this.hexCounter = null; // Set from database during initialization
    }

    async initialize() {
        try {
            const result = await this.pool.query("SELECT record_id FROM tse_student_records ORDER BY record_id DESC LIMIT 1");
            if (result.rows.length > 0) {
                const lastHex = result.rows[0].record_id.substring(1);
                this.hexCounter = parseInt(lastHex, 16) + 1;
            } else {
                this.hexCounter = 0x900000; // Start of Student range
            }
            this.isInitialized = true;
            console.log(`StudentComponent initialized. Next record ID hex: 0x${this.hexCounter.toString(16).toUpperCase()}`);
            return true;
        } catch (error) {
            console.error('StudentComponent initialization failed:', error);
            throw error;
        }
    }

    _generateRecordId() {
        const recordId = `#${this.hexCounter.toString(16).toUpperCase().padStart(6, '0')}`;
        this.hexCounter++;
        return recordId;
    }

    /**
     * Records the outcome of a chat interaction in the TSE loop.
     * @param {string} cycleId - The cycle ID for this interaction.
     * @param {string} teacherRecordId - The ID of the corresponding teacher record.
     * @param {Object} studentData - The student outcome data.
     * @returns {Promise<object>} The newly created student record.
     */
    async recordChatOutcome(cycleId, teacherRecordId, studentData) {
        if (!this.isInitialized) throw new Error("StudentComponent not initialized.");

        const record_id = this._generateRecordId();
        const {
            real_world_outcome,
            success_metrics,
            quality_indicators,
            user_engagement,
            character_similarity_accuracy
        } = studentData;

        const query = `
            INSERT INTO tse_student_records (
                record_id, cycle_id, teacher_record_id, student_sequence,
                real_world_outcome, success_metrics, quality_indicators,
                user_engagement, character_similarity_accuracy
            ) VALUES ($1, $2, $3, (SELECT COALESCE(MAX(student_sequence), 0) + 1 FROM tse_student_records WHERE cycle_id = $2::varchar), $4, $5, $6, $7, $8)
            RETURNING *;
        `;

        try {
            const result = await this.pool.query(query, [
                record_id,
                cycleId,
                teacherRecordId,
                real_world_outcome,
                success_metrics,
                quality_indicators,
                user_engagement,
                character_similarity_accuracy
            ]);

            console.log(`Student outcome recorded: ${record_id} for cycle ${cycleId}`);
            return result.rows[0];

        } catch (error) {
            console.error(`Failed to record student chat outcome for cycle ${cycleId}:`, error);
            throw error;
        }
    }

    // ================================================================================
    // JSONB-COMPATIBLE DUAL CHUNKER INTEGRATION WITH STRICT SEPARATION
    // ================================================================================

    /**
     * Process KNOWLEDGE BASE text through Knowledge Chunker
     * Uses existing tse_student_records table with JSONB structure
     * @param {string} text - Curated knowledge text to be chunked
     * @param {string} cycleId - TSE cycle identifier
     * @returns {Promise<object>} Knowledge chunker results and learning record
     */
    async processKnowledgeBase(text, cycleId) {
        if (!this.isInitialized) throw new Error("StudentComponent not initialized.");

        try {
            console.log(`🧠 Processing Knowledge Base text for cycle ${cycleId}`);

            // Call Knowledge Base Chunker (back to localhost for now)
            const response = await fetch('http://localhost:8000/chunk_knowledge/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, config: {} })
            });

            if (!response.ok) {
                throw new Error(`Knowledge Chunker API error: ${response.status}`);
            }

            const chunkerResult = await response.json();

            // Create JSONB-compatible student data for knowledge learning
            const studentData = {
                real_world_outcome: {
                    outcome_type: 'knowledge_learned',
                    chunker_status: chunkerResult.status,
                    processing_time: chunkerResult.log?.find(l => l.includes('chunking time')),
                    source_type: 'knowledge_base'
                },
                success_metrics: {
                    chunks_generated: chunkerResult.total_chunks_returned,
                    processing_efficiency: this._calculateKnowledgeScore(chunkerResult),
                    knowledge_quality: this._calculateKnowledgeQuality(chunkerResult.chunks),
                    entity_extraction_rate: this._extractKnowledgeEntities(chunkerResult.chunks)
                },
                quality_indicators: {
                    chunker_confidence: this._calculateAvgConfidence(chunkerResult.chunks),
                    chunk_diversity: this._calculateChunkDiversity(chunkerResult.chunks),
                    chunking_strategies: this._getChunkingStrategies(chunkerResult.chunks),
                    metadata_richness: this._calculateMetadataRichness(chunkerResult.chunks)
                },
                user_engagement: {
                    engagement_type: 'knowledge_ingestion',
                    learning_potential: this._calculateKnowledgeQuality(chunkerResult.chunks),
                    chatbot_accessibility: true,
                    knowledge_category: this._categorizeKnowledge(chunkerResult.chunks)
                },
                character_similarity_accuracy: this._extractKnowledgeEntities(chunkerResult.chunks)
            };

            // Record in existing tse_student_records table
            const record_id = this._generateRecordId();
            const teacher_record_id = `K${cycleId.substring(1)}`; // Knowledge teacher record ID
            
            const query = `
                INSERT INTO tse_student_records (
                    record_id, cycle_id, teacher_record_id, student_sequence,
                    real_world_outcome, success_metrics, quality_indicators,
                    user_engagement, character_similarity_accuracy
                ) VALUES ($1, $2, $3, (SELECT COALESCE(MAX(student_sequence), 0) + 1 FROM tse_student_records WHERE cycle_id = $2::varchar), $4, $5, $6, $7, $8)
                RETURNING *;
            `;

            const dbResult = await this.pool.query(query, [
                record_id,
                cycleId,
                teacher_record_id,
                studentData.real_world_outcome,
                studentData.success_metrics,
                studentData.quality_indicators,
                studentData.user_engagement,
                studentData.character_similarity_accuracy
            ]);

            console.log(`✅ Knowledge processed and recorded: ${record_id} for cycle ${cycleId}`);

            return {
                type: 'knowledge_learning',
                student_record: dbResult.rows[0],
                chunker_result: chunkerResult,
                chatbot_accessible: true,
                processing_metrics: {
                    chunks_learned: chunkerResult.total_chunks_returned,
                    knowledge_quality: studentData.success_metrics.knowledge_quality,
                    entities_extracted: studentData.success_metrics.entity_extraction_rate
                }
            };

        } catch (error) {
            console.error(`❌ Failed to process knowledge base for cycle ${cycleId}:`, error);
            throw error;
        }
    }

    /**
     * Process CONVERSATION text through Conversational Chunker
     * Uses existing tse_student_records table but with conversation-specific JSONB data
     * @param {string} text - User conversation text
     * @param {string} cycleId - TSE cycle identifier
     * @param {string} userId - User identifier for tracking
     * @returns {Promise<object>} Conversation analysis results (NOT added to knowledge)
     */
    async processConversation(text, cycleId, userId = 'anonymous') {
        if (!this.isInitialized) throw new Error("StudentComponent not initialized.");

        try {
            console.log(`💬 Processing Conversation for cycle ${cycleId} from user ${userId}`);

            // Call Conversational Chunker via ngrok tunnel
            const response = await fetch('https://4bc92dd44c2b.ngrok-free.app/chunk_conversation/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, config: {} })
            });

            if (!response.ok) {
                throw new Error(`Conversation Chunker API error: ${response.status}`);
            }

            const chunkerResult = await response.json();

            // Create JSONB-compatible student data for conversation analysis
            const studentData = {
                real_world_outcome: {
                    outcome_type: 'conversation_analyzed',
                    chunker_status: chunkerResult.status,
                    user_id: userId,
                    conversation_flow: chunkerResult.total_chunks_returned > 0 ? 'flow_maintained' : 'flow_disrupted',
                    source_type: 'user_conversation'
                },
                success_metrics: {
                    chunks_detected: chunkerResult.total_chunks_returned,
                    conversation_quality: this._calculateConversationQuality(chunkerResult),
                    pattern_detection_rate: this._extractConversationPatterns(chunkerResult.chunks),
                    processing_speed: this._extractProcessingSpeed(chunkerResult.log)
                },
                quality_indicators: {
                    conversation_continuity: chunkerResult.total_chunks_returned > 0 ? 'maintained' : 'disrupted',
                    candidate_entities: this._countCandidateEntities(chunkerResult.chunks),
                    slot_mapping_potential: this._calculateSlotMappingPotential(chunkerResult.chunks),
                    response_appropriateness: this._calculateConversationQuality(chunkerResult)
                },
                user_engagement: {
                    engagement_type: 'conversation_interaction',
                    engagement_level: this._calculateUserEngagement(chunkerResult.chunks),
                    chatbot_accessibility: false, // NOT added to ChatBot3000 knowledge
                    conversation_safety: 'isolated_analysis'
                },
                character_similarity_accuracy: this._extractConversationPatterns(chunkerResult.chunks)
            };

            // Record in existing tse_student_records table (but separate from knowledge)
            const record_id = this._generateRecordId();
            const teacher_record_id = `C${cycleId.substring(1)}`; // Conversation teacher record ID
            
            const query = `
                INSERT INTO tse_student_records (
                    record_id, cycle_id, teacher_record_id, student_sequence,
                    real_world_outcome, success_metrics, quality_indicators,
                    user_engagement, character_similarity_accuracy
                ) VALUES ($1, $2, $3, (SELECT COALESCE(MAX(student_sequence), 0) + 1 FROM tse_student_records WHERE cycle_id = $2::varchar), $4, $5, $6, $7, $8)
                RETURNING *;
            `;

            const dbResult = await this.pool.query(query, [
                record_id,
                cycleId,
                teacher_record_id,
                studentData.real_world_outcome,
                studentData.success_metrics,
                studentData.quality_indicators,
                studentData.user_engagement,
                studentData.character_similarity_accuracy
            ]);

            console.log(`✅ Conversation analyzed and recorded: ${record_id} for cycle ${cycleId}`);

            return {
                type: 'conversation_analysis',
                student_record: dbResult.rows[0],
                chunker_result: chunkerResult,
                chatbot_accessible: false, // Security: NOT accessible to ChatBot3000
                processing_metrics: {
                    conversation_flow: studentData.real_world_outcome.conversation_flow,
                    user_engagement: studentData.user_engagement.engagement_level,
                    patterns_detected: studentData.success_metrics.pattern_detection_rate
                }
            };

        } catch (error) {
            console.error(`❌ Failed to process conversation for cycle ${cycleId}:`, error);
            throw error;
        }
    }

    /**
     * ChatBot3000 knowledge retrieval - READ ONLY access to learned knowledge
     * Searches through existing tse_student_records for knowledge-type entries
     * @param {string} query - What ChatBot3000 wants to know about
     * @returns {Promise<object>} Available knowledge for conversation
     */
    async getChatBotKnowledge(query) {
        try {
            console.log(`🤖 ChatBot3000 requesting knowledge about: ${query}`);

            // Search through learned knowledge records (READ ONLY)
            const knowledgeQuery = `
                SELECT 
                    record_id,
                    cycle_id,
                    real_world_outcome,
                    success_metrics,
                    quality_indicators,
                    user_engagement,
                    character_similarity_accuracy,
                    created_at
                FROM tse_student_records
                WHERE real_world_outcome->>'outcome_type' = 'knowledge_learned'
                AND (
                    (success_metrics->>'knowledge_quality')::decimal > 0.5
                    OR (quality_indicators->>'chunker_confidence')::decimal > 0.5
                )
                ORDER BY 
                    (success_metrics->>'knowledge_quality')::decimal DESC,
                    created_at DESC
                LIMIT 10;
            `;

            const result = await this.pool.query(knowledgeQuery);

            console.log(`✅ Found ${result.rows.length} knowledge records for ChatBot3000`);

            return {
                available_knowledge: result.rows,
                source: 'learned_knowledge_base',
                access_type: 'read_only',
                query_processed: query,
                knowledge_count: result.rows.length
            };

        } catch (error) {
            console.error(`❌ Failed to retrieve knowledge for ChatBot3000:`, error);
            return { available_knowledge: [], error: error.message };
        }
    }

    // ================================================================================
    // HELPER METHODS FOR JSONB-COMPATIBLE CHUNKER PROCESSING
    // ================================================================================

    _calculateKnowledgeQuality(chunks) {
        if (!chunks || chunks.length === 0) return 0.0;
        
        // Knowledge quality based on chunk richness and metadata
        const avgConfidence = chunks.reduce((sum, chunk) => {
            return sum + (chunk.metadata?.confidence || 0.5);
        }, 0) / chunks.length;
        
        return Math.min(1.0, avgConfidence);
    }

    _calculateKnowledgeScore(chunkerResult) {
        if (chunkerResult.status !== 'success') return 0.0;
        
        const efficiency = chunkerResult.log?.find(l => l.includes('per second'));
        const chunksPerChar = chunkerResult.total_chunks_returned / 100; // Normalize
        
        return Math.min(1.0, chunksPerChar * 5 + (efficiency ? 0.3 : 0));
    }

    _extractKnowledgeEntities(chunks) {
        if (!chunks || chunks.length === 0) return 0.0;
        
        // Focus on quantified entities and compound terms for knowledge
        const knowledgeChunks = chunks.filter(chunk => 
            chunk.chunking_strategy === 'quantified_entity' || 
            chunk.chunking_strategy === 'multi_word_entity' ||
            chunk.metadata?.category === 'measurement'
        );
        
        return knowledgeChunks.length / chunks.length;
    }

    _calculateUserEngagement(chunks) {
        if (!chunks || chunks.length === 0) return 0.0;
        
        // Engagement based on conversation patterns
        const candidateEntities = chunks.filter(chunk => 
            chunk.strategy === 'CANDIDATE_ENTITY'
        );
        
        return Math.min(1.0, candidateEntities.length / Math.max(1, chunks.length));
    }

    _calculateConversationQuality(chunkerResult) {
        if (chunkerResult.status !== 'success') return 0.0;
        
        // Conversation quality based on processing speed and chunk relevance
        const processingSpeed = parseFloat(chunkerResult.log?.find(l => l.includes('per second'))?.match(/\d+/)?.[0] || '0');
        
        return Math.min(1.0, processingSpeed / 100000); // Normalize speed score
    }

    _extractConversationPatterns(chunks) {
        if (!chunks || chunks.length === 0) return 0.0;
        
        // Look for conversation flow indicators
        const flowChunks = chunks.filter(chunk => 
            chunk.metadata?.slot_category_hint?.includes('character') ||
            chunk.metadata?.slot_category_hint?.includes('narrative')
        );
        
        return flowChunks.length / chunks.length;
    }

    _calculateAvgConfidence(chunks) {
        if (!chunks || chunks.length === 0) return 0.0;
        
        const avgConfidence = chunks.reduce((sum, chunk) => {
            return sum + (chunk.metadata?.confidence || 0.5);
        }, 0) / chunks.length;
        
        return Math.min(1.0, avgConfidence);
    }

    _calculateChunkDiversity(chunks) {
        if (!chunks || chunks.length === 0) return 0;
        
        const strategies = new Set(chunks.map(c => c.chunking_strategy || c.strategy));
        return strategies.size;
    }

    _getChunkingStrategies(chunks) {
        if (!chunks || chunks.length === 0) return [];
        
        const strategies = [...new Set(chunks.map(c => c.chunking_strategy || c.strategy))];
        return strategies;
    }

    _calculateMetadataRichness(chunks) {
        if (!chunks || chunks.length === 0) return 0.0;
        
        const avgMetadataFields = chunks.reduce((sum, chunk) => {
            const metadataFieldCount = chunk.metadata ? Object.keys(chunk.metadata).length : 0;
            return sum + metadataFieldCount;
        }, 0) / chunks.length;
        
        return Math.min(1.0, avgMetadataFields / 10); // Normalize to 0-1
    }

    _categorizeKnowledge(chunks) {
        if (!chunks || chunks.length === 0) return 'unknown';
        
        const categories = chunks.map(c => c.metadata?.category || 'general');
        const mostCommon = categories.reduce((a, b, i, arr) => 
            arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        );
        
        return mostCommon;
    }

    _countCandidateEntities(chunks) {
        if (!chunks || chunks.length === 0) return 0;
        
        return chunks.filter(chunk => 
            chunk.strategy === 'CANDIDATE_ENTITY' ||
            chunk.chunking_strategy === 'entity'
        ).length;
    }

    _calculateSlotMappingPotential(chunks) {
        if (!chunks || chunks.length === 0) return 0.0;
        
        const slotMappingChunks = chunks.filter(chunk => 
            chunk.metadata?.slot_category_hint?.includes('character') ||
            chunk.metadata?.slot_category_hint?.includes('narrative') ||
            chunk.metadata?.slot_category_hint?.includes('domain')
        );
        
        return slotMappingChunks.length / chunks.length;
    }

    _extractProcessingSpeed(logEntries) {
        if (!logEntries || !Array.isArray(logEntries)) return 0;
        
        const speedEntry = logEntries.find(l => l.includes('per second'));
        if (speedEntry) {
            const match = speedEntry.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
        }
        return 0;
    }
}

export default StudentComponent;
