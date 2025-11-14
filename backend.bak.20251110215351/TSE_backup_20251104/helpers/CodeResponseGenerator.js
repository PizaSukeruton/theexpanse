// backend/TSE/helpers/CodeResponseGenerator.js
// A dynamic, database-driven generative model for a closed-loop system.

// You will need to install this dependency: npm install pg
import pkg from 'pg';
const { Client  } = pkg;

class CodeResponseGenerator {
    constructor() {
        console.log('[TSE-CODING] CodeResponseGenerator initialized');
        
        // IMPORTANT: Replace these with your actual PostgreSQL connection details.
        // DO NOT expose this in a public-facing application.
        this.client = new Client({
            user: 'pizasukerutondb_user',
            host: 'dpg-d1l7cr7diees73fag97g-a',
            database: 'pizasukerutondb',
            password: 'Srd0ECwQ4GeulQxTFhdDUYirRwxp71G6',
            port: 5432, // Default PostgreSQL port
        });
        
        // Connect to the database immediately upon initialization
        this.connectToDatabase();
    }
    
    async connectToDatabase() {
        try {
            await this.client.connect();
            console.log('[TSE-CODING] Successfully connected to PostgreSQL database.');
        } catch (error) {
            console.error('[TSE-CODING] Failed to connect to database:', error);
            // In a real application, you would handle this error more gracefully.
        }
    }

    /**
     * Generate a code response based on the instruction
     * @param {Object} instruction - The coding instruction from teacher
     * @returns {Object} Generated code response with code, processingTime, etc.
     */
    async generateResponse(instruction) {
        const startTime = Date.now();
        
        try {
            // Construct the full prompt from instruction
            let prompt = this.buildPrompt(instruction);
            
            const language = instruction.language || 'html';
            const difficulty = instruction.difficulty || 'beginner';
            
            let code = '';
            
            // Check if it's a yes/no question format
            if (prompt.includes('yes/no questions') || instruction.type === 'quiz') {
                const questionCount = this.extractQuestionCount(prompt) || instruction.questionCount || 1;
                const concepts = instruction.keyConcepts?.[0] || 'basics';
                code = this.generateBooleanAnswers(language, concepts, questionCount);
            } else {
                // This is the core logic for generating code from the database.
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

    /**
     * Generate actual code based on language, difficulty, and instruction by querying the database.
     */
    async generateCode(language, difficulty, instruction) {
        const task = instruction.prompt || '';
        
        try {
            const queryText = `
                SELECT solution_template, requirements FROM tse_coding_challenges
                WHERE language = $1 AND is_active = true
            `;
            const res = await this.client.query(queryText, [language]);
            
            let generatedCode = `// No specific generative algorithm found for this task.\n// Your internal logic would go here.`;

            // Find a matching rule from the database results
            const matchingRule = res.rows.find(row => {
                const requirements = row.requirements;
                // Assuming `requirements` is a JSONB array of objects like `[{"pattern": "..."}]`
                return requirements.some(req => task.includes(req.pattern));
            });

            if (matchingRule) {
                // Found a rule, now apply the template
                let template = matchingRule.solution_template;

                // This is where you would perform the template replacements
                // based on the instruction and the specific pattern matched.
                if (task.includes('iterate from')) {
                    const parts = task.match(/from (\d+) to (\d+)/);
                    if (parts && parts.length === 3) {
                        template = template.replace('{{start}}', parts[1]).replace('{{end}}', parts[2]);
                    }
                } else if (task.includes('create a list of')) {
                    const listItems = instruction.keyConcepts || ['Item 1', 'Item 2', 'Item 3'];
                    const listItemsHtml = listItems.map(item => `  <li>${item}</li>`).join('\n');
                    template = template.replace('{{items}}', listItemsHtml);
                } else if (task.includes('create a div with the id')) {
                    const idMatch = task.match(/id "(.*?)"/);
                    const textMatch = task.match(/text "(.*?)"/);
                    const divId = idMatch ? idMatch[1] : 'my-div';
                    const divText = textMatch ? textMatch[1] : 'Hello World';
                    template = template.replace('{{id}}', divId).replace('{{text}}', divText);
                }
                
                generatedCode = template;
            }

            return generatedCode;
        } catch (error) {
            console.error('[TSE-CODING] Error querying database for rules:', error);
            return `// Error: Failed to retrieve rules from the database.`;
        }
    }
    
    /**
     * Helper method to build a comprehensive prompt for the internal LLM.
     * @param {Object} instruction - The coding instruction
     * @returns {string} The formatted prompt string
     */
    buildPrompt(instruction) {
        let prompt = instruction.prompt;
        if (instruction.keyConcepts && instruction.keyConcepts.length > 0) {
            prompt += ` with key concepts: ${instruction.keyConcepts.join(', ')}`;
        }
        return prompt;
    }

    /**
     * Placeholder method for generating boolean answers for quizzes.
     * @param {string} language - The programming language
     * @param {string} concepts - The key concepts for the quiz
     * @param {number} count - The number of questions to generate
     * @returns {string} The generated quiz content
     */
    generateBooleanAnswers(language, concepts, count) {
        // This is a simplified placeholder.
        // Your logic for generating questions would go here.
        return `// Quiz content generator for ${count} questions on ${concepts} in ${language} is not implemented.`;
    }
    
    /**
     * Placeholder method to extract question count from a prompt.
     * @param {string} prompt - The prompt string
     * @returns {number | null} The number of questions or null if not found
     */
    extractQuestionCount(prompt) {
        // Simple regex to find a number.
        const match = prompt.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : null;
    }
}

export default CodeResponseGenerator;

