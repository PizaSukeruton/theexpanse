// batchImportTransitionPhrases.js
// Short, casual "ready to proceed?" utterances for Claude

import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const phrases = [
  // READY CHECK - Openers (lead-ins)
  { role: 'opener', text: 'So…', tone: 'playful', formality: 'casual', outcome_intent: 'connection', strategy: 'ready_check' },
  { role: 'opener', text: 'Alright…', tone: 'warm', formality: 'casual', outcome_intent: 'connection', strategy: 'ready_check' },
  { role: 'opener', text: 'Now then…', tone: 'playful', formality: 'casual', outcome_intent: 'connection', strategy: 'ready_check' },
  { role: 'opener', text: 'Well…', tone: 'warm', formality: 'casual', outcome_intent: 'connection', strategy: 'ready_check' },
  
  // READY CHECK - Content (the actual question)
  { role: 'content', text: 'Shall we begin?', tone: 'warm', formality: 'casual', outcome_intent: 'connection', strategy: 'ready_check' },
  { role: 'content', text: 'Ready to explore?', tone: 'playful', formality: 'casual', outcome_intent: 'connection', strategy: 'ready_check' },
  { role: 'content', text: 'Ready when you are.', tone: 'warm', formality: 'casual', outcome_intent: 'connection', strategy: 'ready_check' },
  { role: 'content', text: 'Want to get started?', tone: 'playful', formality: 'casual', outcome_intent: 'connection', strategy: 'ready_check' },
  { role: 'content', text: 'Shall we?', tone: 'playful', formality: 'casual', outcome_intent: 'connection', strategy: 'ready_check' },
  { role: 'content', text: 'Let me know when you are ready.', tone: 'warm', formality: 'casual', outcome_intent: 'connection', strategy: 'ready_check' },
  
  // READY CHECK - Closers (optional trailing)
  { role: 'closer', text: 'No rush.', tone: 'warm', formality: 'casual', outcome_intent: 'connection', strategy: 'ready_check' },
  { role: 'closer', text: 'Take your time.', tone: 'warm', formality: 'casual', outcome_intent: 'connection', strategy: 'ready_check' },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting transition phrases batch import...');
    await client.query('BEGIN');

    for (const p of phrases) {
      const phraseHexId = await generateHexId('learning_vocabulary_id');
      
      const insertSql = `
        INSERT INTO conversational_phrases (
          phrase_hex_id,
          text,
          role,
          outcome_intent,
          strategy,
          tone,
          formality,
          language,
          tags,
          created_by,
          is_canonical
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
      
      await client.query(insertSql, [
        phraseHexId,
        p.text,
        p.role,
        p.outcome_intent,
        p.strategy,
        p.tone,
        p.formality,
        'en',
        JSON.stringify(['transition', 'ready_check']),
        '700002',
        true
      ]);
      
      console.log(`  ✓ Inserted ${phraseHexId}: ${p.role} - "${p.text}"`);
    }

    await client.query('COMMIT');
    console.log(`\nTransition phrases batch import committed. ${phrases.length} phrases added.`);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Batch import failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('Transition phrases import finished.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
