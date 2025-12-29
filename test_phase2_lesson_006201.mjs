import pool from './backend/db/pool.js';

const res = await pool.query(
  `SELECT lesson_id, lesson_name, level, difficulty, knowledge_domain
   FROM tse_storytelling_lessons
   WHERE lesson_id = $1`,
  ['#AF00B8']
);

console.log('Phase 2 lesson check:');
console.log(res.rows[0] || null);

await pool.end();
process.exit(0);
