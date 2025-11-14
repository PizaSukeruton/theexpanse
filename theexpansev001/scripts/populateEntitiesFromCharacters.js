import pool from '../backend/db/pool.js';
import { insertEntity, findEntityBySource } from '../backend/utils/entityHelpers.js';

/**
 * populateEntitiesFromCharacters.js
 * 
 * Migrates all characters from character_profiles to entities table
 * Maps each character to its appropriate realm
 * Skips characters that already have entity records
 * 
 * Realm Mapping:
 * #F00000 - Piza Sukeruton Multiverse (all current characters)
 * 
 * Character categories map to entity types:
 * - "Knowledge Entity" → KNOWLEDGE (informational entities like NOFX, Pokemon)
 * - Everything else → PERSON (story characters)
 */

const REALM_MAPPING = {
  default: '#F00000' // Piza Sukeruton Multiverse
};

const ENTITY_TYPE_MAPPING = {
  'Knowledge Entity': 'KNOWLEDGE',
  'default': 'PERSON'
};

async function getEntityTypeForCategory(category) {
  return ENTITY_TYPE_MAPPING[category] || ENTITY_TYPE_MAPPING.default;
}

async function getAllCharacters() {
  const query = `
    SELECT 
      character_id,
      character_name,
      category,
      description
    FROM character_profiles
    ORDER BY character_id;
  `;
  
  const result = await pool.query(query);
  return result.rows;
}

async function populateEntities() {
  console.log('========================================');
  console.log('ENTITY POPULATION SCRIPT');
  console.log('========================================\n');

  try {
    // Get all characters
    console.log('Fetching all characters from character_profiles...');
    const characters = await getAllCharacters();
    console.log(`Found ${characters.length} characters\n`);

    let skipped = 0;
    let inserted = 0;
    let errors = 0;

    for (const char of characters) {
      try {
        // Check if entity already exists for this character
        const existing = await findEntityBySource(
          'character_profiles',
          char.character_id,
          REALM_MAPPING.default
        );

        if (existing) {
          console.log(`⏭️  SKIP: ${char.character_name} (${char.character_id}) - already exists as ${existing.entity_id}`);
          skipped++;
          continue;
        }

        // Determine entity type from category
        const entity_type = await getEntityTypeForCategory(char.category);

        // Build search context
        const search_context = char.description 
          ? `${char.category} - ${char.description}`
          : char.category;

        // Insert entity
        const result = await insertEntity({
          realm_hex_id: REALM_MAPPING.default,
          entity_type: entity_type,
          entity_name: char.character_name,
          source_table: 'character_profiles',
          source_hex_id: char.character_id,
          search_context: search_context
        });

        console.log(`✅ INSERT: ${char.character_name} (${char.character_id}) → ${result.entity.entity_id}`);
        console.log(`   Type: ${entity_type}, Category: ${char.category}`);
        inserted++;

      } catch (error) {
        console.error(`❌ ERROR: ${char.character_name} (${char.character_id})`);
        console.error(`   ${error.message}`);
        errors++;
      }
    }

    console.log('\n========================================');
    console.log('POPULATION COMPLETE');
    console.log('========================================');
    console.log(`Total characters: ${characters.length}`);
    console.log(`✅ Inserted: ${inserted}`);
    console.log(`⏭️  Skipped (already exist): ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('========================================\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  }
}

populateEntities();
