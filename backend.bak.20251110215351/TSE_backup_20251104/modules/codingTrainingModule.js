// backend/tse/modules/codingTrainingModule.js
// This module integrates with the TSE loop for Claude's coding training

import pool from '../../db/pool.js';
import generateAokHexId from '../../utils/hexIdGenerator.js';

/**
 * TSE Coding Training Module
 * Provides methods for the TSE loop to interact with Claude's coding education
 */
class CodingTrainingModule {
    constructor() {
        this.characterId = '#700002'; // Claude The Tanuki
        this.supportedLanguages = ['html', 'javascript', 'python'];
    }

    /**
     * Teacher Component: Generate a coding lesson or challenge for Claude
     * @param {Object} context - Current learning context
     * @returns {Object} Teacher instruction with lesson/challenge
     */
    async generateTeacherInstruction(context) {
        const client = await pool.connect();
        try {
            const { language, currentLevel, lastAttemptScore, topic } = context;

            // Determine appropriate difficulty based on performance
            const difficulty = this.calculateDifficulty(currentLevel, lastAttemptScore);

            // Find an appropriate teacher record or challenge
            const query = `
                SELECT 
                    tr.*,
                    c.challenge_name,
                    c.challenge_description,
                    c.requirements,
                    c.test_cases,
                    c.solution_template
                FROM tse_coding_teacher_records tr
                LEFT JOIN tse_coding_challenges c ON tr.challenge_id = c.challenge_id
                WHERE tr.language = $1 
                    AND tr.difficulty = $2
                    AND tr.is_active = true
                    ${topic ? 'AND tr.topic = $3' : ''}
                ORDER BY RANDOM()
                LIMIT 1
            `;
            
            const params = [language, difficulty];
            if (topic) params.push(topic);

            const result = await client.query(query, params);

            if (result.rows.length === 0) {
                // No matching lesson found, create a basic instruction
                return {
                    type: 'lesson',
                    language,
                    difficulty,
                    instruction: `Practice ${language} ${difficulty} level coding`,
                    prompt: `Write a ${language} program that demonstrates ${topic || 'basic concepts'}.`
                };
            }

            const record = result.rows[0];

            // Structure the teacher instruction
            const instruction = {
                type: record.challenge_id ? 'challenge' : 'lesson',
                recordId: record.record_id,
                language: record.language,
                difficulty: record.difficulty,
                topic: record.topic,
                lessonTitle: record.lesson_title,
                lessonContent: record.lesson_content,
                instruction: record.explanation,
                codeExample: record.code_example,
                keyConcepts: record.key_concepts,
                commonMistakes: record.common_mistakes,
                bestPractices: record.best_practices
            };

            // If it's a challenge, add challenge-specific data
            if (record.challenge_id) {
                instruction.challengeData = {
                    challengeId: record.challenge_id,
                    challengeName: record.challenge_name,
                    description: record.challenge_description,
                    requirements: record.requirements,
                    testCases: record.test_cases,
                    solutionTemplate: record.solution_template
                };
                instruction.prompt = record.challenge_description;
            } else {
                // Generate a practice prompt based on the lesson
                instruction.prompt = this.generatePracticePrompt(record);
            }

            console.log(`[TSE-Coding-Module] Generated teacher instruction for ${language} - ${topic}`);
            return instruction;

        } catch (error) {
            console.error('[TSE-Coding-Module] Error generating teacher instruction:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Student Component: Record Claude's coding attempt
     * @param {Object} attempt - Claude's coding attempt data
     * @returns {Object} Recorded attempt with ID
     */
    async recordStudentAttempt(attempt) {
        const client = await pool.connect();
        try {
            const {
                teacherRecordId,
                challengePrompt,
                studentCode,
                executionTimeMs,
                hintsUsed,
                contextProvided
            } = attempt;

            await client.query('BEGIN');

            // Generate attempt ID
            const attemptId = await generateAokHexId('tse_coding_attempt');

            // Insert the attempt
            const insertQuery = `
                INSERT INTO tse_coding_student_records (
                    attempt_id, character_id, teacher_record_id,
                    challenge_prompt, student_code, execution_time_ms,
                    hints_used, context_provided
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;

            const result = await client.query(insertQuery, [
                attemptId,
                this.characterId,
                teacherRecordId,
                challengePrompt,
                studentCode,
                executionTimeMs || null,
                JSON.stringify(hintsUsed || []),
                JSON.stringify(contextProvided || {})
            ]);

            await client.query('COMMIT');

            console.log(`[TSE-Coding-Module] Recorded student attempt: ${attemptId}`);
            return {
                success: true,
                attempt: result.rows[0]
            };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('[TSE-Coding-Module] Error recording student attempt:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Evaluator Component: Evaluate Claude's coding attempt
     * @param {String} attemptId - The attempt to evaluate
     * @param {Object} evaluationCriteria - Criteria for evaluation
     * @returns {Object} Evaluation results
     */
    async evaluateAttempt(attemptId, evaluationCriteria = {}) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Fetch the attempt and related data
            const attemptQuery = `
                SELECT 
                    sa.*,
                    tr.code_example as reference_solution,
                    tr.language,
                    tr.topic,
                    tr.difficulty,
                    c.test_cases,
                    c.reference_solution as challenge_solution
                FROM tse_coding_student_records sa
                JOIN tse_coding_teacher_records tr ON sa.teacher_record_id = tr.record_id
                LEFT JOIN tse_coding_challenges c ON tr.challenge_id = c.challenge_id
                WHERE sa.attempt_id = $1
            `;

            const attemptResult = await client.query(attemptQuery, [attemptId]);
            
            if (attemptResult.rows.length === 0) {
                throw new Error('Attempt not found');
            }

            const attemptData = attemptResult.rows[0];

            // Perform evaluation (simplified - in production, this would be more sophisticated)
            const evaluation = await this.performCodeEvaluation(attemptData, evaluationCriteria);

            // Generate evaluation ID
            const evaluationId = await generateAokHexId('tse_coding_evaluation');

            // Store evaluation
            const insertEvalQuery = `
                INSERT INTO tse_coding_evaluation_records (
                    evaluation_id, attempt_id, correctness_score, efficiency_score,
                    readability_score, best_practices_score, overall_score,
                    evaluation_type, detailed_feedback, errors_found, suggestions
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            `;

            const evalResult = await client.query(insertEvalQuery, [
                evaluationId,
                attemptId,
                evaluation.correctnessScore,
                evaluation.efficiencyScore,
                evaluation.readabilityScore,
                evaluation.bestPracticesScore,
                evaluation.overallScore,
                evaluation.evaluationType,
                evaluation.detailedFeedback,
                JSON.stringify(evaluation.errorsFound),
                JSON.stringify(evaluation.suggestions)
            ]);

            // Update progress tracking
            await this.updateProgress(client, attemptData, evaluation.overallScore);

            await client.query('COMMIT');

            console.log(`[TSE-Coding-Module] Completed evaluation: ${evaluationId}`);
            return {
                success: true,
                evaluation: evalResult.rows[0],
                shouldAdvance: evaluation.overallScore >= 80
            };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('[TSE-Coding-Module] Error evaluating attempt:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get current learning state for Claude in a specific language/topic
     * @param {String} language - Programming language
     * @param {String} topic - Optional specific topic
     * @returns {Object} Current learning state
     */
    async getLearningState(language, topic = null) {
        try {
            let query = `
                SELECT * FROM tse_coding_progress
                WHERE character_id = $1 AND language = $2
            `;
            const params = [this.characterId, language];

            if (topic) {
                query += ' AND topic = $3';
                params.push(topic);
            }

            const result = await pool.query(query, params);

            if (result.rows.length === 0) {
                // No progress yet, return default state
                return {
                    language,
                    topic,
                    currentDifficulty: 'beginner',
                    totalAttempts: 0,
                    averageScore: 0,
                    readyForAdvancement: false
                };
            }

            const progress = result.rows[0];
            return {
                progressId: progress.progress_id,
                language: progress.language,
                topic: progress.topic,
                currentDifficulty: progress.current_difficulty,
                totalAttempts: progress.total_attempts,
                successfulAttempts: progress.successful_attempts,
                averageScore: progress.average_score,
                scoreHistory: progress.score_history,
                readyForAdvancement: progress.ready_for_advancement,
                recommendedNextTopic: progress.recommended_next_topic,
                lastAttemptAt: progress.last_attempt_at
            };

        } catch (error) {
            console.error('[TSE-Coding-Module] Error getting learning state:', error);
            throw error;
        }
    }

    /**
     * Helper: Calculate appropriate difficulty based on performance
     */
    calculateDifficulty(currentLevel, lastScore) {
        if (!currentLevel) return 'beginner';
        
        const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
        const currentIndex = levels.indexOf(currentLevel);
        
        // Advance if consistently scoring above 80
        if (lastScore >= 80 && currentIndex < levels.length - 1) {
            return levels[currentIndex + 1];
        }
        
        // Stay at current level if scoring 60-79
        if (lastScore >= 60) {
            return currentLevel;
        }
        
        // Move down if struggling (below 60)
        if (currentIndex > 0) {
            return levels[currentIndex - 1];
        }
        
        return currentLevel;
    }

    /**
     * Helper: Generate practice prompt from lesson
     */
    generatePracticePrompt(lesson) {
        const prompts = {
            html: `Create an HTML page that demonstrates ${lesson.topic}. ${lesson.subtopic ? `Focus on ${lesson.subtopic}.` : ''}`,
            javascript: `Write a JavaScript function that implements ${lesson.topic}. ${lesson.subtopic ? `Specifically work with ${lesson.subtopic}.` : ''}`,
            python: `Create a Python program that shows your understanding of ${lesson.topic}. ${lesson.subtopic ? `Make sure to include ${lesson.subtopic}.` : ''}`
        };

        return prompts[lesson.language] || `Practice ${lesson.language} by implementing ${lesson.topic}.`;
    }

    /**
     * Helper: Perform code evaluation (simplified version)
     */
    async performCodeEvaluation(attemptData, criteria) {
        // In a real implementation, this would:
        // 1. Run test cases if available
        // 2. Check for syntax errors
        // 3. Analyze code structure and style
        // 4. Compare against reference solution
        // 5. Use static analysis tools

        const hasTestCases = attemptData.test_cases && attemptData.test_cases.length > 0;
        const referenceCode = attemptData.challenge_solution || attemptData.reference_solution;

        // Simplified scoring
        let correctnessScore = 70; // Base score
        let efficiencyScore = 75;
        let readabilityScore = 80;
        let bestPracticesScore = 75;

        const errorsFound = [];
        const suggestions = [];

        // Basic code analysis
        const studentCode = attemptData.student_code.toLowerCase();
        
        // Check for common issues based on language
        if (attemptData.language === 'javascript') {
            if (!studentCode.includes('const') && !studentCode.includes('let')) {
                bestPracticesScore -= 10;
                suggestions.push('Use const or let instead of var for variable declarations');
            }
            if (studentCode.includes('var ')) {
                bestPracticesScore -= 5;
                suggestions.push('Prefer const/let over var in modern JavaScript');
            }
        }

        // Check code length and structure
        const codeLines = attemptData.student_code.split('\n').filter(line => line.trim());
        if (codeLines.length < 3) {
            correctnessScore -= 20;
            errorsFound.push('Code appears incomplete or too brief');
        }

        // Calculate overall score
        const overallScore = Math.round(
            (correctnessScore + efficiencyScore + readabilityScore + bestPracticesScore) / 4
        );

        // Generate feedback
        const detailedFeedback = this.generateDetailedFeedback(
            overallScore,
            attemptData.topic,
            errorsFound,
            suggestions
        );

        return {
            correctnessScore,
            efficiencyScore,
            readabilityScore,
            bestPracticesScore,
            overallScore,
            evaluationType: 'automated',
            detailedFeedback,
            errorsFound,
            suggestions
        };
    }

    /**
     * Helper: Generate detailed feedback message
     */
    generateDetailedFeedback(score, topic, errors, suggestions) {
        let feedback = '';
        
        if (score >= 80) {
            feedback = `Excellent work on ${topic}! Your code demonstrates a strong understanding. `;
        } else if (score >= 60) {
            feedback = `Good effort on ${topic}. Your code shows understanding but has room for improvement. `;
        } else {
            feedback = `Keep practicing ${topic}. Review the lesson material and try again. `;
        }

        if (errors.length > 0) {
            feedback += `Issues found: ${errors.join(', ')}. `;
        }

        if (suggestions.length > 0) {
            feedback += `Suggestions: ${suggestions.join('; ')}.`;
        }

        return feedback;
    }

    /**
     * Helper: Update progress tracking
     */
    async updateProgress(client, attemptData, score) {
        // Check if progress record exists
        const checkQuery = `
            SELECT * FROM tse_coding_progress
            WHERE character_id = $1 AND language = $2 AND topic = $3
            FOR UPDATE
        `;
        
        const progressResult = await client.query(checkQuery, [
            this.characterId,
            attemptData.language,
            attemptData.topic
        ]);

        const now = new Date().toISOString();
        const scoreEntry = {
            date: now,
            score: score,
            attempt_id: attemptData.attempt_id
        };

        if (progressResult.rows.length === 0) {
            // Create new progress record
            const progressId = await generateAokHexId('tse_coding_progress');
            const insertQuery = `
                INSERT INTO tse_coding_progress (
                    progress_id, character_id, language, topic,
                    total_attempts, successful_attempts, average_score,
                    current_difficulty, score_history, last_attempt_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `;

            await client.query(insertQuery, [
                progressId,
                this.characterId,
                attemptData.language,
                attemptData.topic,
                1,
                score >= 70 ? 1 : 0,
                score,
                attemptData.difficulty,
                JSON.stringify([scoreEntry]),
                now
            ]);
        } else {
            // Update existing record
            const progress = progressResult.rows[0];
            const scoreHistory = progress.score_history || [];
            scoreHistory.push(scoreEntry);

            const totalAttempts = progress.total_attempts + 1;
            const successfulAttempts = progress.successful_attempts + (score >= 70 ? 1 : 0);
            const avgScore = Math.round(
                scoreHistory.reduce((sum, h) => sum + h.score, 0) / scoreHistory.length
            );

            // Check readiness for advancement
            const recentScores = scoreHistory.slice(-5).map(h => h.score);
            const readyForAdvancement = recentScores.length >= 3 && 
                                       recentScores.every(s => s >= 80) &&
                                       attemptData.difficulty !== 'expert';

            const updateQuery = `
                UPDATE tse_coding_progress
                SET total_attempts = $1,
                    successful_attempts = $2,
                    average_score = $3,
                    score_history = $4,
                    ready_for_advancement = $5,
                    last_attempt_at = $6,
                    updated_at = $6
                WHERE progress_id = $7
            `;

            await client.query(updateQuery, [
                totalAttempts,
                successfulAttempts,
                avgScore,
                JSON.stringify(scoreHistory),
                readyForAdvancement,
                now,
                progress.progress_id
            ]);
        }
    }
}

export default CodingTrainingModule;
