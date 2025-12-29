import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

async function main() {
const client = await pool.connect();
try {
const entityId = await generateHexId('entity_id');

const realmHexId = '#F00000';
const entityType = 'PERSON';
const category = 'Council Of The Wise';
const entityName = 'Fanny The Mermaid';
const sourceTable = 'character_profiles';
const sourceHexId = '#70001D';
const searchContext = 'Council Of The Wise – Mermaid in the Earth Realm';

const entityNameNormalized = entityName.toLowerCase().trim();

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
  )
  VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    soundex($6::varchar),
    metaphone($6::varchar, 16),
    dmetaphone($6::varchar),
    dmetaphone_alt($6::varchar),
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
  realmHexId,
  entityType,
  category,
  entityName,
  entityNameNormalized,
  sourceTable,
  sourceHexId,
  searchContext
];

const result = await client.query(query, values);
console.log('Created entity:', result.rows);
} catch (err) {
console.error('Error creating Fanny entity:', err.message);
} finally {
client.release();
process.exit(0);
}
}

main();
