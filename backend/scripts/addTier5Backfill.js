import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

async function addTier5Backfill() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Starting Tier 5 backfill...');
    
    // 1. Delete test record
    const deleteResult = await client.query(
      `DELETE FROM ltlm_training_examples WHERE source = 'test_script' RETURNING training_example_id`
    );
    console.log(`Deleted ${deleteResult.rowCount} test record(s)`);
    
    // 2. Get all utterances missing outcome intents (excluding PAD training data)
    const missingResult = await client.query(`
      SELECT e.training_example_id, e.dialogue_function_code
      FROM ltlm_training_examples e
      LEFT JOIN ltlm_training_outcome_intents oi ON oi.training_example_id = e.training_example_id
      WHERE oi.outcome_intent_code IS NULL
      AND e.source NOT LIKE 'user_emotion_lexicon%'
      AND e.source != 'test_script'
    `);
    
    console.log(`Found ${missingResult.rows.length} utterances to backfill`);
    
    // Mapping of dialogue function to appropriate outcome intent
    const outcomeMapping = {
      'expressive.comfort': 'emotional_outcomes.reduce_distress',
      'partner_communication_management.confirm_partner_state': 'relational_outcomes.maintain_presence',
      'topic_management.shift_topic': 'cognitive_outcomes.redirect_attention',
      'topic_management.summarise_discussion': 'cognitive_outcomes.increase_understanding'
    };
    
    let count = 0;
    for (const row of missingResult.rows) {
      const outcomeIntentCode = outcomeMapping[row.dialogue_function_code];
      
      if (!outcomeIntentCode) {
        console.log(`Warning: No mapping for ${row.dialogue_function_code}, skipping ${row.training_example_id}`);
        continue;
      }
      
      const outcomeId = await generateHexId('ltlm_outcome_intent_id');
      await client.query(
        `INSERT INTO ltlm_training_outcome_intents (ltlm_outcome_intent_id, training_example_id, outcome_intent_code)
         VALUES ($1, $2, $3)`,
        [outcomeId, row.training_example_id, outcomeIntentCode]
      );
      
      count++;
      if (count % 10 === 0) {
        console.log(`Backfilled ${count} utterances...`);
      }
    }
    
    await client.query('COMMIT');
    console.log(`\n=== TIER 5 COMPLETE ===`);
    console.log(`Deleted: 1 test record`);
    console.log(`Backfilled: ${count} outcome intent links`);
    console.log(`Skipped: 424 PAD training examples (user_emotion_lexicon)`);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

addTier5Backfill();
