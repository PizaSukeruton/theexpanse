import pool from './backend/db/pool.js';
import generateHexId from './backend/utils/hexIdGenerator.js';
import fs from 'fs';

async function importPokemonQA() {
    try {
        const data = JSON.parse(fs.readFileSync('pokemon_tse_qa.json', 'utf8'));
        const domainId = '#AE0002';
        const claudeId = '#700002';
        let imported = 0;
        
        for (const qa of data.questions) {
            const knowledgeId = await generateHexId('knowledge_item_id');
            const content = `Q: ${qa.question}\nA: ${qa.correct_answer}\n${qa.explanation}`;
            
            await pool.query(`
                INSERT INTO knowledge_items (
                    knowledge_id, 
                    content, 
                    concept, 
                    domain_id, 
                    initial_character_id, 
                    source_type
                )
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                knowledgeId, 
                content, 
                qa.concept.substring(0, 40), 
                domainId, 
                claudeId, 
                'pokemon_qa'
            ]);
            
            imported++;
            console.log(`Imported ${imported}: ${knowledgeId} - ${qa.concept}`);
        }
        
        console.log(`Successfully imported ${imported} Pokemon Q&A pairs`);
        process.exit(0);
    } catch (error) {
        console.error('Import failed:', error.message);
        process.exit(1);
    }
}

importPokemonQA();
