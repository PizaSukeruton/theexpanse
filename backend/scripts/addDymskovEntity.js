import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

async function addDymskovEntity() {
  try {
    const entityId = await generateHexId('entity_id');
    
    const query = `
      INSERT INTO entities (
        entity_id,
        realm_hex_id,
        entity_type,
        category,
        entity_name,
        entity_name_normalized,
        phonetic_soundex,
        phonetic_metaphone,
        phonetic_dmetaphone,
        phonetic_dmetaphone_alt,
        source_table,
        source_hex_id,
        search_context,
        created_at,
        updated_at
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6::VARCHAR,
        soundex($6::VARCHAR),
        metaphone($6::VARCHAR, 16),
        dmetaphone($6::VARCHAR),
        dmetaphone_alt($6::VARCHAR),
        $7,
        $8,
        $9,
        NOW(),
        NOW()
      )
      RETURNING *;
    `;
    
    const values = [
      entityId,
      '#F00000',
      'PERSON',
      'Council Of The Wise',
      'Dymskov',
      'dymskov',
      'character_profiles',
      '#700024',
      'Council Of The Wise member'
    ];
    
    const result = await pool.query(query, values);
    console.log('✅ Dymskov added to entities:', result.rows[0].entity_id);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addDymskovEntity();
