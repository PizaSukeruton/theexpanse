import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

const connectionString = 'postgresql://pizasukerutondb_user:Srd0ECwQ4GeulQxTFhdDUYirRwxp71G6@dpg-d1l7cr7diees73fag97g-a.oregon-postgres.render.com/pizasukerutondb';

async function run() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const filename = 'backend/scripts/output/system_concepts_pizasukerutondb_2025-12-07T03-10-37-362.json';
    const raw = fs.readFileSync(path.resolve(filename), 'utf8');
    const parsed = JSON.parse(raw);

    const concepts = parsed.concepts || [];
    const concept = concepts.find(c => c.concept_name === 'character_profiles');

    if (!concept) {
      console.error('character_profiles concept not found');
      process.exit(1);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertSql = `
        INSERT INTO system_concepts (concept_id, concept_name, concept_type, concept_json)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (concept_id) DO UPDATE
        SET concept_name = EXCLUDED.concept_name,
            concept_type = EXCLUDED.concept_type,
            concept_json = EXCLUDED.concept_json
      `;

      await client.query(insertSql, [
        concept.concept_id,
        concept.concept_name,
        concept.type,
        concept
      ]);

      await client.query('COMMIT');
      console.log('Inserted/updated concept for character_profiles with id', concept.concept_id);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error inserting concept:', err.message);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Fatal error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
