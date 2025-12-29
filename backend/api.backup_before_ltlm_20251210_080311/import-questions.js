import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const { questions, topic } = req.body;
  const results = [];
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
        topic,
        q.type,
        JSON.stringify(q),
        1.0,
        JSON.stringify([]),
        0,
        0.5
      ];
      await pool.query(insert, values);
      results.push({ question: q.question, status: 'OK', id });
    } catch (err) {
      results.push({ question: q.question, status: 'FAIL', error: err.message });
    }
  }
  res.json({ results });
}
