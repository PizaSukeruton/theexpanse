import readline from 'readline';
import pool from './backend/db/pool.js';
import generateHexId from './backend/utils/hexIdGenerator.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (q) => new Promise((resolve) => rl.question(q, resolve));

async function createKnowledgeEntity() {
    console.log('\n=== CREATE KNOWLEDGE ENTITY ===\n');
    
    try {
        // Step 1: Get entity name
        const entityName = await question('Enter entity name (e.g., NOFX): ');
        
        // Step 2: Get description
        const description = await question('Enter description: ');
        
        // Step 3: Generate character_id
        const characterId = await generateHexId('character_id');
        
        // Step 4: Insert into character_profiles
        await pool.query(
            'INSERT INTO character_profiles (character_id, character_name, category, description) VALUES ($1, $2, $3, $4)',
            [characterId, entityName, 'Knowledge Entity', description]
        );
        
        console.log(`\nCreated Knowledge Entity: ${entityName} (${characterId})`);
        
        // Step 5: Ask if they want to add knowledge
        const addKnowledge = await question('\nAdd knowledge about this entity? (y/n): ');
        
        if (addKnowledge.toLowerCase() === 'y') {
            await addKnowledgeItems(characterId, entityName);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        rl.close();
        await pool.end();
    }
}

async function addKnowledgeItems(entityId, entityName) {
    console.log(`\n=== ADD KNOWLEDGE ABOUT ${entityName} ===\n`);
    
    let addMore = true;
    while (addMore) {
        const statement = await question('Enter knowledge statement: ');
        const difficulty = await question('Difficulty (1-100): ');
        
        // Generate knowledge_id
        const knowledgeId = await generateHexId('knowledge_item_id');
        
        // Create JSON content
        const content = JSON.stringify({
            type: 'fact',
            subject: entityName,
            statement: statement,
            entity_id: entityId
        });
        
        // Insert knowledge item
        await pool.query(
            'INSERT INTO knowledge_items (knowledge_id, content, domain_id, source_type, initial_character_id, complexity_score, concept) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [
                knowledgeId,
                content,
                '#AE0001', // General knowledge domain for now
                'admin_entry',
                entityId, // The entity owns this knowledge
                parseInt(difficulty) / 100,
                entityName.toLowerCase()
            ]
        );
        
        console.log(`Added knowledge: ${knowledgeId}`);
        
        const more = await question('\nAdd more knowledge? (y/n): ');
        addMore = more.toLowerCase() === 'y';
    }
}

createKnowledgeEntity();
