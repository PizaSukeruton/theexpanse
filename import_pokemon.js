import pool from './backend/db/pool.js';
import generateHexId from './backend/utils/hexIdGenerator.js';
import fs from 'fs';

async function importPokemonQA() {
    try {
        const data = JSON.parse(fs.readFileSync('pokemon_qa.json', 'utf8'));
        
        // First create Pokemon domain
        const domainId = await generateHexId('domain_id');
        await pool.query(`
            INSERT INTO knowledge_domains (domain_id, domain_name, description, is_active)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (domain_id) DO NOTHING
        `, [domainId, 'Pokemon Knowledge', 'Pokemon lore, mechanics, and trivia', true]);
        
        console.log(`Created domain: ${domainId}`);
        
        // Import each Q&A
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
                '#700002', 
                'pokemon_qa'
            ]);
            
            console.log(`Imported: ${knowledgeId} - ${qa.concept}`);
        }
        
        console.log(`Successfully imported ${data.questions.length} Pokemon Q&A pairs`);
        process.exit(0);
    } catch (error) {
        console.error('Import failed:', error);
        process.exit(1);
    }
}

importPokemonQA();
