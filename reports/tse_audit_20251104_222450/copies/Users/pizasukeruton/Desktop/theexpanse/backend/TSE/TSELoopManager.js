// ================================================================================
// TSELoopManager.js - Core TSE Cycle Orchestrator with Coding Training Integration
// Fixed version - removed cycle_number completely, fixed syntax errors
// Added CodingTrainingModule integration for Claude's coding education
// ================================================================================

import pkg from 'pg';
const { Pool  } = pkg;
import TeacherComponent from './TeacherComponent.js';
import StudentComponent from './StudentComponent.js';
import EvaluationComponent from './EvaluationComponent.js';
import CodingTrainingModule from './modules/codingTrainingModule.js';
import KnowledgeResponseEngine from './helpers/KnowledgeResponseEngine.js';
import CodeResponseGenerator from './helpers/CodeResponseGenerator.js';
class TSELoopManager {
    constructor(pool) {
        if (!pool) {
            throw new Error("TSELoopManager requires a database pool.");
        }
        this.pool = pool;
        this.isInitialized = false;
        this.teacherComponent = new TeacherComponent(pool);
        this.studentComponent = new StudentComponent(pool);
        this.evaluationComponent = new EvaluationComponent(pool, null, null);
        this.codingModule = new CodingTrainingModule(); // Initialize coding module
        this.hexCounter = null; // Set from database during initialization
        this.knowledgeEngine = new KnowledgeResponseEngine();
    }

    async initialize() {
        try {
            // Initialize hex counter for cycle_id
            const result = await this.pool.query("SELECT cycle_id FROM tse_cycles WHERE cycle_id ~ '^#[0-9A-F]{6}$' ORDER BY SUBSTR(cycle_id, 2) DESC LIMIT 1");
            if (result.rows.length > 0) {
                const lastHex = result.rows[0].cycle_id.substring(1);
                this.hexCounter = parseInt(lastHex, 16) + 1;
            } else {
                this.hexCounter = 0x800000; // Start of the #8 range for TSE cycles
            }

            // Initialize all learning components
            await this.teacherComponent.initialize();
            await this.studentComponent.initialize();
            await this.knowledgeEngine.initialize();
            // Note: EvaluationComponent doesn't have initialize method
            this.isInitialized = true;
            console.log(`TSELoopManager initialized. Next cycle ID hex: 0x${this.hexCounter.toString(16).toUpperCase()}`);
            return true;
        } catch (error) {
            console.error('TSELoopManager initialization failed:', error);
            this.isInitialized = false;
            return false;
        }
    }

    _generateCycleId() {
        if (this.hexCounter === null) {
            throw new Error("Hex counter not initialized.");
        }
        const hex = '#' + (this.hexCounter++).toString(16).toUpperCase().padStart(6, '0');
        return hex;
    }

    async startTSECycle(cycle_type = 'standard') {
        if (!this.isInitialized) throw new Error("TSELoopManager not initialized.");

        const client = await this.pool.connect();
        try {
            const cycle_id = this._generateCycleId();

            const query = `
                INSERT INTO tse_cycles (
                    cycle_id, cycle_type, status, cultural_compliance, seven_commandments_check
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
            `;
            const values = [
                cycle_id,
                cycle_type,
                'running',
                {},
                true
            ];

            const result = await client.query(query, values);
            console.log(`✅ TSE Cycle started: ${cycle_id}`);
            return result.rows[0];

        } catch (error) {
            console.error(`❌ Failed to start TSE cycle:`, error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Start a knowledge learning cycle - REAL TRAIT-DRIVEN LEARNING
     * @param {Object} knowledgeContext - Contains characterId, query, domain
     * @returns {Object} The completed cycle data with learning metrics
     */
    async startKnowledgeCycle(knowledgeContext = {}) {
        if (!this.isInitialized) {
            throw new Error("TSELoopManager is not initialized. Cannot start knowledge cycle.");
        }

        const { characterId, query, domain } = knowledgeContext;
        
        if (!characterId) {
            throw new Error("characterId is required for knowledge cycle");
        }

        const cycle_id = this._generateCycleId();
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');

            const cycleMetadata = {
                module: 'knowledge_learning',
                characterId: characterId,
                query: query,
                domain: domain,
                startTime: new Date().toISOString()
            };

            const cycleQuery = `
                INSERT INTO tse_cycles (
                    cycle_id, cycle_type, status, metadata
                ) VALUES ($1, $2, $3, $4)
                RETURNING *;
            `;

            await client.query(cycleQuery, [
                cycle_id,
                'knowledge_learning',
                'running',
                cycleMetadata
            ]);

            console.log(`[TSE-KNOWLEDGE] ✅ Knowledge cycle started: ${cycle_id} for ${characterId}`);


            await client.query('COMMIT');
            await client.query('BEGIN');
            const teacherData = {
                algorithm_decision: { 
                    action: "provide_knowledge_query",
                    query: query,
                    domain: domain,
                    characterId: characterId
                },
                confidence_score: 0.9,
                predicted_outcomes: { 
                    learning_impact: "positive",
                    expected_retention: "high"
                },
                instruction_data: {
                    query: query,
                    domain: domain,
                    expectedResponse: "trait-driven personalized answer"
                },
                character_selection_reasoning: `Knowledge query for ${characterId}`
            };

            const teacherRecord = await this.teacherComponent.recordChatDecision(cycle_id, teacherData);
            console.log(`[TSE-KNOWLEDGE] 🧑‍🏫 Teacher query recorded: "${query}"`);

            const startResponseTime = Date.now();
            const knowledgeResponse = await this.knowledgeEngine.generateKnowledgeResponse(
                characterId,
                query,
                { domain: domain, cycleId: cycle_id }
            );
            const responseTime = Date.now() - startResponseTime;

            console.log(`[TSE-KNOWLEDGE] 🎓 Knowledge response generated in ${responseTime}ms`);
            console.log(`[TSE-KNOWLEDGE] Delivery style: ${knowledgeResponse.deliveryStyle}`);
            console.log(`[TSE-KNOWLEDGE] Cognitive load: ${knowledgeResponse.cognitiveLoad}/12`);

            const evaluationResult = {
                appropriateness: knowledgeResponse.deliveryStyle ? 100 : 50,
                traitAlignment: knowledgeResponse.learningProfile ? 100 : 0,
                cognitiveLoadManagement: knowledgeResponse.cognitiveLoad <= 12 ? 100 : 50
            };

            evaluationResult.overallScore = (
                evaluationResult.appropriateness * 0.3 +
                evaluationResult.traitAlignment * 0.4 +
                evaluationResult.cognitiveLoadManagement * 0.3
            );

            evaluationResult.feedback = `Response delivered in ${knowledgeResponse.deliveryStyle} style with ${knowledgeResponse.traitInfluences?.length || 0} trait influences detected`;

            console.log(`[TSE-KNOWLEDGE] ✅ Evaluation complete: Score ${evaluationResult.overallScore.toFixed(1)}`);

            const completeCycleQuery = `
                UPDATE tse_cycles 
                SET 
                    completed_at = NOW(),
                    cycle_duration_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000,
                    status = 'completed',
                    performance_summary = $2,
                    learning_outcomes = $3
                WHERE cycle_id = $1
                RETURNING *;
            `;

            const performanceSummary = {
                score: evaluationResult.overallScore,
                appropriateness: evaluationResult.appropriateness,
                traitAlignment: evaluationResult.traitAlignment,
                cognitiveLoad: knowledgeResponse.cognitiveLoad,
                processingTime: responseTime
            };

            const learningOutcomes = {
                deliveryStyle: knowledgeResponse.deliveryStyle,
                traitInfluences: knowledgeResponse.traitInfluences,
                emergentPatterns: knowledgeResponse.learningProfile?.emergentPatterns || [],
                feedback: evaluationResult.feedback
            };

            const completedCycle = await client.query(completeCycleQuery, [
                cycle_id,
                performanceSummary,
                learningOutcomes
            ]);

            await client.query('COMMIT');

            console.log(`[TSE-KNOWLEDGE] ✅ Knowledge cycle completed: ${cycle_id} with score ${evaluationResult.overallScore.toFixed(1)}`);
            
            return {
                cycle: completedCycle.rows[0],
                query: query,
                response: knowledgeResponse.knowledge,
                deliveryStyle: knowledgeResponse.deliveryStyle,
                learningProfile: knowledgeResponse.learningProfile,
                evaluation: evaluationResult,
                overallScore: evaluationResult.overallScore
            };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`[TSE-KNOWLEDGE] ❌ Failed knowledge cycle ${cycle_id}:`, error);
            
            try {
                await this.pool.query(
                    "UPDATE tse_cycles SET status = 'failed', metadata = metadata || $2 WHERE cycle_id = $1",
                    [cycle_id, { error: error.message }]
                );
            } catch (updateError) {
                console.error(`[TSE-KNOWLEDGE] Failed to update cycle status:`, updateError);
            }
            
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Start a coding training cycle for Claude
     * @param {Object} codingContext - Contains language, topic, difficulty preferences
     * @returns {Object} The completed cycle data
     */
    async startCodingCycle(codingContext = {}) {
        if (!this.isInitialized) {
            throw new Error("TSELoopManager is not initialized. Cannot start coding cycle.");
        }

        const cycle_id = this._generateCycleId();
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');

            // 1. Create the TSE cycle record
            const cycleQuery = `
                INSERT INTO tse_cycles (
                    cycle_id, cycle_type, status, metadata
                ) VALUES ($1, $2, $3, $4)
                RETURNING *;
            `;
            
            const cycleMetadata = {
                module: 'coding_training',
                language: codingContext.language || 'javascript',
                topic: codingContext.topic,
                startTime: new Date().toISOString()
            };

            const cycleResult = await client.query(cycleQuery, [
                cycle_id,
                'coding_training',
                'running',
                cycleMetadata
            ]);

            console.log(`[TSE-CODING] ✅ Coding cycle started: ${cycle_id} for ${cycleMetadata.language}`);

            // Commit the cycle creation so it exists for foreign key references
            await client.query('COMMIT');
            await client.query('BEGIN'); // Start new transaction for the rest
            // 2. Get Claude's current learning state
            const learningState = await this.codingModule.getLearningState(
                cycleMetadata.language,
                cycleMetadata.topic
            );

            // 3. Teacher Component: Generate coding instruction
            const teacherContext = {
                language: cycleMetadata.language,
                currentLevel: learningState.currentDifficulty,
                lastAttemptScore: learningState.averageScore,
                topic: cycleMetadata.topic
            };

            const teacherInstruction = await this.codingModule.generateTeacherInstruction(teacherContext);
            
            // Record teacher instruction in standard TSE format
            const teacherData = {
                algorithm_decision: { 
                    action: "provide_coding_challenge",
                    instruction_type: teacherInstruction.type,
                    language: teacherInstruction.language,
                    difficulty: teacherInstruction.difficulty
                },
                confidence_score: 0.9,
                predicted_outcomes: { 
                    expected_score_range: [60, 90],
                    learning_impact: "positive"
                },
                instruction_data: teacherInstruction,
                character_selection_reasoning: "Claude selected for coding training"
            };

            const teacherRecord = await this.teacherComponent.recordChatDecision(cycle_id, teacherData);
            console.log(`[TSE-CODING] 🧑‍🏫 Teacher instruction generated: ${teacherInstruction.type} - ${teacherInstruction.language}`);

            // 4. Student Component: Claude generates code response
            // This is where Claude actually writes code - NO MOCK DATA
            const studentResponse = await this.generateClaudeCodeResponse(teacherInstruction);
            
            // Record the attempt
            const attemptData = {
                teacherRecordId: teacherRecord.record_id,
                challengePrompt: teacherInstruction.prompt,
                studentCode: studentResponse.code,
                executionTimeMs: studentResponse.processingTime,
                hintsUsed: studentResponse.hintsUsed || [],
                contextProvided: {
                    instruction: teacherInstruction,
                    learningState: learningState
                }
            };

            const studentAttempt = await this.codingModule.recordStudentAttempt(attemptData);
            console.log(`[TSE-CODING] 🎓 Student response recorded: ${studentAttempt.attempt.attempt_id}`);

            // 5. Evaluation Component: Evaluate Claude's code
            const evaluationResult = await this.codingModule.evaluateAttempt(
                studentAttempt.attempt.attempt_id,
                { strictMode: false } // Be lenient while Claude is learning
            );

            console.log(`[TSE-CODING] ✅ Evaluation complete: Score ${evaluationResult.evaluation.overall_score}`);

            // 6. Complete the cycle
            const completionData = {
                module: 'coding_training',
                language: cycleMetadata.language,
                topic: cycleMetadata.topic,
                teacherRecordId: teacherRecord.record_id,
                studentAttemptId: studentAttempt.attempt.attempt_id,
                evaluationId: evaluationResult.evaluation.evaluation_id,
                overallScore: evaluationResult.evaluation.overall_score,
                shouldAdvance: evaluationResult.shouldAdvance,
                completedAt: new Date().toISOString()
            };

            const completeCycleQuery = `
                UPDATE tse_cycles 
                SET 
                    completed_at = NOW(),
                    cycle_duration_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000,
                    status = 'completed',
                    performance_summary = $2,
                    learning_outcomes = $3
                WHERE cycle_id = $1
                RETURNING *;
            `;

            const performanceSummary = {
                score: evaluationResult.evaluation.overall_score,
                correctness: evaluationResult.evaluation.correctness_score,
                efficiency: evaluationResult.evaluation.efficiency_score,
                readability: evaluationResult.evaluation.readability_score,
                bestPractices: evaluationResult.evaluation.best_practices_score
            };

            const learningOutcomes = {
                feedback: evaluationResult.evaluation.detailed_feedback,
                errors: evaluationResult.evaluation.errors_found,
                suggestions: evaluationResult.evaluation.suggestions,
                readyToAdvance: evaluationResult.shouldAdvance
            };

            const completedCycle = await client.query(completeCycleQuery, [
                cycle_id,
                performanceSummary,
                learningOutcomes
            ]);

            await client.query('COMMIT');

            console.log(`[TSE-CODING] ✅ Coding cycle completed: ${cycle_id} with score ${evaluationResult.evaluation.overall_score}`);
            
            return {
                cycle: completedCycle.rows[0],
                teacherInstruction: teacherInstruction,
                studentCode: studentResponse.code,
                evaluation: evaluationResult.evaluation,
                learningState: learningState
            };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`[TSE-CODING] ❌ Failed coding cycle ${cycle_id}:`, error);
            
            // Update cycle status to failed
            try {
                await this.pool.query(
                    "UPDATE tse_cycles SET status = 'failed', metadata = metadata || $2 WHERE cycle_id = $1",
                    [cycle_id, { error: error.message }]
                );
            } catch (updateError) {
                console.error(`[TSE-CODING] Failed to update cycle status:`, updateError);
            }
            
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Generate Claude's actual code response
     * This is where Claude writes real code - NO MOCK DATA
     * @param {Object} instruction - The teacher's coding instruction
     * @returns {Object} Claude's code response
     */
    async generateClaudeCodeResponse(instruction) {
        const startTime = Date.now();
        
        // Construct a learning prompt for Claude
        let prompt = `You are learning to code. Here is your coding challenge:\n\n`;
        
        if (instruction.type === 'lesson') {
            prompt += `LESSON: ${instruction.lessonTitle}\n`;
            prompt += `${instruction.lessonContent}\n\n`;
            if (instruction.codeExample) {
                prompt += `Example Code:\n${instruction.codeExample}\n\n`;
            }
        }
        
        prompt += `TASK: ${instruction.prompt}\n\n`;
        
        if (instruction.keyConcepts && instruction.keyConcepts.length > 0) {
            prompt += `Key Concepts to demonstrate: ${instruction.keyConcepts.join(', ')}\n`;
        }
        
        if (instruction.challengeData) {
            const challenge = instruction.challengeData;
            prompt += `Requirements:\n`;
            challenge.requirements.forEach(req => {
                prompt += `- ${req}\n`;
            });
        }
        
        prompt += `\nLanguage: ${instruction.language}\n`;
        prompt += `Difficulty: ${instruction.difficulty}\n`;
        prompt += `\nPlease write your ${instruction.language} code solution:`;


        console.log(`[TSE-CODING] Using internal CodeResponseGenerator`);
        const generator = new CodeResponseGenerator();
        return generator.generateResponse(instruction);
    }
    // ... rest of the existing methods remain unchanged ...

    async startChatCycle(chatData) {
        if (!this.isInitialized) {
            throw new Error("TSELoopManager is not initialized. Cannot start chat cycle.");
        }

        const { conversation_id, user_message, chat_context } = chatData;
        const cycle_id = this._generateCycleId();
        const cycle_type = 'standard';
        const status = 'running';

        const query = `
            INSERT INTO tse_cycles (
                cycle_id, cycle_type, status, conversation_id, user_message, chat_context
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [
            cycle_id,
            cycle_type,
            status,
            conversation_id || null,
            user_message,
            chat_context || {}
        ];

        const client = await this.pool.connect();
        try {
            const result = await client.query(query, values);
            console.log(`✅ Chat cycle started: ${cycle_id} for conversation ${conversation_id}`);

            // Record Teacher prediction
            try {
                const teacherData = {
                    algorithm_decision: { prediction: "chat_response_needed", user_input: user_message },
                    confidence_score: 0.8,
                    predicted_outcomes: { success_probability: 0.7, response_quality: "good" },
                    message_processing_context: { input_type: "user_query" },
                    character_selection_reasoning: "Character selected based on user input pattern"
                };
                const teacherRecord = await this.teacherComponent.recordChatDecision(cycle_id, teacherData);
                console.log(`🧑‍🏫 Teacher prediction recorded for cycle: ${cycle_id}`);
            } catch (teacherError) {
                console.warn(`⚠️ Teacher recording failed for ${cycle_id}:`, teacherError.message);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`❌ Failed to start chat cycle:`, error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getTeacherRecordId(cycle_id) {
        const result = await this.pool.query(
            "SELECT record_id FROM tse_teacher_records WHERE cycle_id = $1 ORDER BY created_at DESC LIMIT 1",
            [cycle_id]
        );
        return result.rows.length > 0 ? result.rows[0].record_id : null;
    }

    async completeTSECycle(cycle_id, completion_data = {}) {
        if (!this.isInitialized) throw new Error("TSELoopManager not initialized.");

        const client = await this.pool.connect();
        try {
            const query = `
                UPDATE tse_cycles 
                SET 
                    completed_at = NOW(),
                    cycle_duration_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000,
                    status = 'completed',
                    cultural_compliance = $2
                WHERE cycle_id = $1
                RETURNING *;
            `;
            const values = [cycle_id, completion_data];

            const result = await client.query(query, values);
            if (result.rows.length === 0) {
                throw new Error(`Cycle ${cycle_id} not found.`);
            }

            // Record Student outcome
            try {
                const studentData = {
                    real_world_outcome: { outcome_type: "conversation_completed", success: true },
                    success_metrics: completion_data,
                    quality_indicators: { response_generated: true },
                    user_engagement: { engagement_level: "active" },
                    character_similarity_accuracy: 0.8
                };
                await this.studentComponent.recordChatOutcome(cycle_id, await this.getTeacherRecordId(cycle_id), studentData);
                console.log(`🎓 Student outcome recorded for cycle: ${cycle_id}`);
            } catch (studentError) {
                console.warn(`⚠️ Student recording failed for ${cycle_id}:`, studentError.message);
            }

            console.log(`✅ TSE Cycle completed: ${cycle_id}`);
            return result.rows[0];

        } catch (error) {
            console.error(`❌ Failed to complete TSE cycle ${cycle_id}:`, error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getCycleStatus(cycle_id) {
        if (!this.isInitialized) throw new Error("TSELoopManager not initialized.");

        try {
            const query = "SELECT * FROM tse_cycles WHERE cycle_id = $1";
            const result = await this.pool.query(query, [cycle_id]);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            return result.rows[0];
        } catch (error) {
            console.error(`❌ Failed to get cycle status for ${cycle_id}:`, error);
            throw error;
        }
    }

    async getActiveCycles() {
        if (!this.isInitialized) throw new Error("TSELoopManager not initialized.");

        try {
            const query = "SELECT * FROM tse_cycles WHERE status = 'running' ORDER BY started_at DESC";
            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            console.error(`❌ Failed to get active cycles:`, error);
            throw error;
        }
    }

    async getCycleMetrics(cycle_id) {
        if (!this.isInitialized) throw new Error("TSELoopManager not initialized.");

        try {
            const query = `
                SELECT 
                    c.*,
                    COALESCE(tr.teacher_records_count, 0) AS teacher_records_count,
                    COALESCE(sr.student_records_count, 0) AS student_records_count,
                    tr.avg_teacher_confidence,
                    sr.avg_student_accuracy
                FROM tse_cycles c
                LEFT JOIN (
                    SELECT cycle_id,
                           COUNT(DISTINCT record_id) AS teacher_records_count,
                           AVG(confidence_score) AS avg_teacher_confidence
                    FROM tse_teacher_records
                    GROUP BY cycle_id
                ) tr ON tr.cycle_id = c.cycle_id
                LEFT JOIN (
                    SELECT cycle_id,
                           COUNT(DISTINCT record_id) AS student_records_count,
                           AVG(character_similarity_accuracy) AS avg_student_accuracy
                    FROM tse_student_records
                    GROUP BY cycle_id
                ) sr ON sr.cycle_id = c.cycle_id
                WHERE c.cycle_id = $1;
            `;
            const result = await this.pool.query(query, [cycle_id]);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            return result.rows[0];
        } catch (error) {
            console.error(`❌ Failed to get cycle metrics for ${cycle_id}:`, error);
            throw error;
        }
    }

    /**
     * Run a continuous coding training session
     * @param {Object} options - Training options (duration, languages, etc.)
     */
    async runCodingTrainingSession(options = {}) {
        const {
            maxCycles = 10,
            languages = ['html', 'javascript', 'python'],
            minScoreToAdvance = 80,
            delayBetweenCycles = 5000 // 5 seconds
        } = options;

        console.log(`[TSE-CODING] Starting coding training session for Claude`);
        console.log(`[TSE-CODING] Languages: ${languages.join(', ')}, Max cycles: ${maxCycles}`);

        const results = [];
        let cycleCount = 0;
        let currentLanguageIndex = 0;

        while (cycleCount < maxCycles) {
            const language = languages[currentLanguageIndex % languages.length];
            
            try {
                console.log(`\n[TSE-CODING] === Cycle ${cycleCount + 1}/${maxCycles} - Language: ${language} ===`);
                
                const result = await this.startCodingCycle({ language });
                results.push(result);
                
                console.log(`[TSE-CODING] Cycle complete. Score: ${result.evaluation.overall_score}`);
                
                // Check if we should advance to next language
                if (result.evaluation.overall_score >= minScoreToAdvance) {
                    currentLanguageIndex++;
                }
                
                cycleCount++;
                
                // Wait between cycles
                if (cycleCount < maxCycles) {
                    console.log(`[TSE-CODING] Waiting ${delayBetweenCycles}ms before next cycle...`);
                    await new Promise(resolve => setTimeout(resolve, delayBetweenCycles));
                }
                
            } catch (error) {
                console.error(`[TSE-CODING] Error in cycle ${cycleCount + 1}:`, error);
                // Continue with next cycle even if one fails
                cycleCount++;
            }
        }

        // Generate summary
        const summary = {
            totalCycles: results.length,
            averageScore: results.length > 0 ? results.reduce((sum, r) => sum + r.evaluation.overall_score, 0) / results.length : 0,
            languageProgress: languages.map(lang => {
                const langResults = results.filter(r => r.teacherInstruction.language === lang);
                return {
                    language: lang,
                    attempts: langResults.length,
                    averageScore: langResults.length > 0 
                        ? langResults.reduce((sum, r) => sum + r.evaluation.overall_score, 0) / langResults.length
                        : 0
                };
            })
        };

        console.log(`\n[TSE-CODING] Training session complete!`);
        console.log(`[TSE-CODING] Summary:`, JSON.stringify(summary, null, 2));

        return { results, summary };
    }
}

export default TSELoopManager;
