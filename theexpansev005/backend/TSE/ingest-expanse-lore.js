import { parseMultiverseLoreDocuments } from './lore-parser-generic.js';
import pool from '../db/pool.js';
import fs from 'fs';

async function ingestExpanseLore() {
  const loreDocuments = [
    fs.readFileSync('your-actual-file.md', 'utf8'),
    fs.readFileSync('your-second-file.md', 'utf8'),
    fs.readFileSync('your-characters-file.md', 'utf8'),
    fs.readFileSync('your-locations-file.md', 'utf8')
  ];

  const { entities, sqlInserts } = parseMultiverseLoreDocuments(
    loreDocuments,
    '#U00001'
  );

  console.log(`Parsed ${entities.length} entities`);
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (let i = 0; i < sqlInserts.length; i++) {
      const sql = sqlInserts[i];
      const knowledgeId = `#L${(i + 1).toString().padStart(5, '0')}`;
      const finalSql = sql
        .replace(/\$knowledge_id_\d+/g, `'${knowledgeId}'`)
        .replace(/\$universe_id/g, `'#U00001'`);
      
      await client.query(finalSql);
    }

    await client.query('COMMIT');
    console.log(`Successfully inserted ${entities.length} entities`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Insertion failed:', error);
  } finally {
    client.release();
  }
}

ingestExpanseLore().catch(console.error);
