import fs from 'fs';
import path from 'path';
import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

async function main() {
  const jsonFile = process.argv[2];
  const domainId = process.argv[3];

  if (!jsonFile || !domainId) {
    console.error('usage: node scripts/import_cotw_dossier_knowledge.js <json_file> <domain_id>');
    process.exit(1);
  }

  const raw = fs.readFileSync(path.resolve(jsonFile), 'utf8');
  const parsed = JSON.parse(raw);

  const items = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed.items)
      ? parsed.items
      : null;

  if (!Array.isArray(items) || items.length === 0) {
    console.error('no iterable items found in JSON');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const item of items) {
      const knowledgeId = await generateHexId('knowledge_item_id');

      await client.query(
        `
        INSERT INTO knowledge_items (
          knowledge_id,
          content,
          semantic_embedding,
          domain_id,
          source_type,
          initial_character_id,
          initial_strength,
          complexity_score,
          concept
        ) VALUES (
          $1,
          $2,
          NULL,
          $3,
          'admin_entry',
          '#700002',
          1,
          $4,
          $5
        )
        `,
        [
          knowledgeId,
          item.content,
          domainId,
          item.complexity_score ?? 0.3,
          item.concept
        ]
      );
    }

    await client.query('COMMIT');
    console.log('Imported ' + items.length + ' knowledge items into domain ' + domainId);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Import failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

main();
