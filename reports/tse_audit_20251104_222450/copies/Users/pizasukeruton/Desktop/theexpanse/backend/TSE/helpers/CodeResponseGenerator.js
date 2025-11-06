// backend/TSE/helpers/CodeResponseGenerator.js
// Database-driven code generation - NO MOCK DATA

import pool from '../../db/pool.js';

class CodeResponseGenerator {
    constructor() {
        console.log('[TSE-CODING] CodeResponseGenerator initialized with pool connection');
    }

    async generateResponse(instruction) {
        const startTime = Date.now();
        
        try {
            let prompt = this.buildPrompt(instruction);
            const language = instruction.language || 'html';
            const difficulty = instruction.difficulty || 'beginner';
            
            let code = '';
            
            if (prompt.includes('yes/no questions') || instruction.type === 'quiz') {
                const questionCount = this.extractQuestionCount(prompt) || instruction.questionCount || 1;
                const concepts = instruction.keyConcepts?.[0] || 'basics';
                code = await this.generateBooleanAnswers(language, concepts, questionCount);
            } else {
                code = await this.generateCode(language, difficulty, instruction);
            }
            
            console.log('[TSE-CODING] Generated response of length:', code.length);
            
            return {
                code: code,
                processingTime: Date.now() - startTime,
                hintsUsed: [],
                metadata: {
                    generatedBy: 'TSE-Internal-CodeGen',
                    language: language,
                    difficulty: difficulty
                }
            };
            
        } catch (error) {
            console.error('[TSE-CODING] Error generating response:', error);
            throw error;
        }
    }

    async generateCode(language, difficulty, instruction) {
        const task = instruction.prompt || '';
        const client = await pool.connect();
        
        try {
            const queryText = `
                SELECT solution_template, requirements FROM tse_coding_challenges
                WHERE language = $1 AND is_active = true
            `;
            const res = await client.query(queryText, [language]);
            
            if (res.rows.length === 0) {
                throw new Error(`No coding challenges found in database for language: ${language}`);
            }

            const matchingRule = res.rows.find(row => {
                const requirements = row.requirements;
                return requirements.some(req => task.includes(req.pattern));
            });

            if (!matchingRule) {
                throw new Error(`No matching template found for task: "${task}". Database has ${res.rows.length} templates for ${language} but none matched.`);
            }

            let template = matchingRule.solution_template;

            if (task.includes('iterate from')) {
                const parts = task.match(/from (\d+) to (\d+)/);
                if (!parts || parts.length !== 3) {
                    throw new Error(`Invalid iteration range in task: "${task}"`);
                }
                template = template.replace('{{start}}', parts[1]).replace('{{end}}', parts[2]);
            } else if (task.includes('create a list of')) {
                if (!instruction.keyConcepts || instruction.keyConcepts.length === 0) {
                    throw new Error('List creation requires keyConcepts in instruction');
                }
                const listItemsHtml = instruction.keyConcepts.map(item => `  <li>${item}</li>`).join('\n');
                template = template.replace('{{items}}', listItemsHtml);
            } else if (task.includes('create a div with the id')) {
                const idMatch = task.match(/id "(.*?)"/);
                const textMatch = task.match(/text "(.*?)"/);
                if (!idMatch || !textMatch) {
                    throw new Error(`Invalid div creation task format: "${task}"`);
                }
                template = template.replace('{{id}}', idMatch[1]).replace('{{text}}', textMatch[1]);
            }
            
            return template;
        } catch (error) {
            console.error('[TSE-CODING] Database query error:', error);
            throw error;
        } finally {
            client.release();
        }
    }
    
    buildPrompt(instruction) {
        let prompt = instruction.prompt;
        if (instruction.keyConcepts && instruction.keyConcepts.length > 0) {
            prompt += ` with key concepts: ${instruction.keyConcepts.join(', ')}`;
        }
        return prompt;
    }

    async generateBooleanAnswers(language, concepts, count) {
        throw new Error(`Quiz generation not implemented for ${language}. Requires real quiz template system in database.`);
    }
    
    extractQuestionCount(prompt) {
        const match = prompt.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : null;
    }
}

export default CodeResponseGenerator;
