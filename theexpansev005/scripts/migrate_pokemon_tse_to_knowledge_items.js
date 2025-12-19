import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';
import knowledgeQueries from '../backend/db/knowledgeQueries.js';

const CLAUDE_ID = '#700002';
const POKEMON_DOMAIN_ID = '#AE0002';

async function run() {
  console.log('[MIGRATE] Starting Pokémon migration into knowledge_items');

  const res = await pool.query(
    `SELECT knowledge_id, accumulated_data
     FROM tse_algorithm_knowledge
     WHERE knowledge_domain = 'Pokemon Knowledge'`
  );

  console.log('[MIGRATE] Rows to migrate:', res.rows.length);

  for (const row of res.rows) {
    const data = row.accumulated_data;
    const question = data.question;
    const answer = data.answer;
    const difficulty = (data.difficulty || '').toLowerCase();

    if (!question || !answer) {
      console.log('[MIGRATE] Skipping', row.knowledge_id, '- missing question or answer');
      continue;
    }

    let complexity = 0.5;
    if (difficulty === 'easy') complexity = 0.3;
    else if (difficulty === 'medium') complexity = 0.5;
    else if (difficulty === 'hard') complexity = 0.8;

    const newId = await generateHexId('knowledge_item_id');

    const content = `Q: ${question}\nA: ${answer}`;

    const inserted = await knowledgeQueries.insertKnowledgeItem({
      knowledge_id: newId,
      content,
      domain_id: POKEMON_DOMAIN_ID,
      source_type: 'tse_algorithm_seed',
      initial_character_id: CLAUDE_ID,
      initial_strength: 1.0,
      complexity_score: complexity
    });

    console.log('[MIGRATE] Inserted', row.knowledge_id, '->', inserted.knowledge_id);
  }

  console.log('[MIGRATE] Done.');
  await pool.end();
}

run().catch(err => {
  console.error('[MIGRATE] Error:', err);
  process.exit(1);
});
