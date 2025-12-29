import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';
import fs from 'fs';

const questions = JSON.parse(fs.readFileSync('pokemon_questions.json', 'utf8'));

async function importBatch() {
  for (const q of questions) {
    try {
      const id = await generateHexId('object_id');
      const insert = `
        INSERT INTO tse_algorithm_knowledge (
          knowledge_id, knowledge_domain, knowledge_category, accumulated_data,
          confidence_level, learning_sources, validation_count, knowledge_weight
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      const values = [
        id,
        'Pokemon Knowledge',
        q.type,
        JSON.stringify(q),
        1.0,
        JSON.stringify([]),
        0,
        0.5
      ];
      await pool.query(insert, values);
      console.log(`Inserted: ${id} (${q.question})`);
    } catch (err) {
      console.error('Failed to insert:', q.question, err.message);
    }
  }
  await pool.end();
}

importBatch();
