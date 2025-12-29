import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

async function testInsert() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database...');
    
    const testId = await generateHexId('ltlm_training_example_id');
    console.log('Generated hex ID:', testId);
    
    await client.query(
      `INSERT INTO ltlm_training_examples (
        training_example_id, speaker_character_id, utterance_text,
        dialogue_function_code, speech_act_code, pad_pleasure, pad_arousal, pad_dominance,
        source, is_canonical, difficulty, category_confidence, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
      [testId, '#700002', 'Test utterance - delete me.', 'auto_feedback.thinking_marker', 'assertive.inform',
       0.1, 0.1, 0.0, 'test_script', true, 1, 0.95, 'test']
    );
    
    console.log('Insert successful!');
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testInsert();
