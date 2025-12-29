import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const qaEntries = [
  {"content": "Q: Is Pikachu an Electric-type Pokémon?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Pikachu"},
  {"content": "Q: Is Charizard a Dragon-type in its base form?\nA: No", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Charizard"},
  {"content": "Q: Is Bulbasaur part Grass-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Bulbasaur"},
  {"content": "Q: Is Squirtle a Fire-type Pokémon?\nA: No", "source_type": "qa_import", "complexity_score": 0.1, "concept": "Squirtle"},
  {"content": "Q: Is Jigglypuff known for putting opponents to sleep?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Jigglypuff"},
  {"content": "Q: Is Meowth able to learn Pay Day naturally?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Meowth"},
  {"content": "Q: Is Onix a Water-type Pokémon?\nA: No", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Onix"},
  {"content": "Q: Is Gengar part Ghost-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Gengar"},
  {"content": "Q: Is Snorlax known for blocking paths in the games?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Snorlax"},
  {"content": "Q: Is Mewtwo a naturally occurring Pokémon?\nA: No", "source_type": "qa_import", "complexity_score": 0.5, "concept": "Mewtwo"},
  {"content": "Q: Is Machop part Psychic-type?\nA: No", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Machop"},
  {"content": "Q: Is Psyduck known for its frequent headaches?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Psyduck"},
  {"content": "Q: Is Magikarp able to learn powerful moves in its base form?\nA: No", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Magikarp"},
  {"content": "Q: Is Eevee capable of evolving into multiple different forms?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Eevee"},
  {"content": "Q: Is Lapras part Ice-type?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Lapras"},
  {"content": "Q: Is Ditto able to transform into other Pokémon?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.2, "concept": "Ditto"},
  {"content": "Q: Is Scyther an evolved form of another Pokémon?\nA: No", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Scyther"},
  {"content": "Q: Is Tauros a Normal-type Pokémon?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Tauros"},
  {"content": "Q: Is Articuno one of the Legendary Birds?\nA: Yes", "source_type": "qa_import", "complexity_score": 0.4, "concept": "Articuno"},
  {"content": "Q: Is Dragonite part Fairy-type?\nA: No", "source_type": "qa_import", "complexity_score": 0.3, "concept": "Dragonite"}
];

const DOMAIN_ID = '#AE0002';
const INITIAL_CHARACTER_ID = '#700007';

async function importQA() {
  console.log(`Starting import of ${qaEntries.length} Q&A entries...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const entry of qaEntries) {
    try {
      const knowledgeId = await generateHexId('knowledge_item_id');
      
      await pool.query(
        `INSERT INTO knowledge_items (knowledge_id, content, domain_id, source_type, initial_character_id, complexity_score, concept)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [knowledgeId, entry.content, DOMAIN_ID, entry.source_type, INITIAL_CHARACTER_ID, entry.complexity_score, entry.concept]
      );
      
      console.log(`Inserted ${knowledgeId}: ${entry.concept}`);
      successCount++;
    } catch (error) {
      console.error(`Failed to insert ${entry.concept}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\nImport complete: ${successCount} success, ${errorCount} errors`);
  await pool.end();
}

importQA();
