import padEstimator from '../services/padEstimator.js';
import DrClaudeModule from '../services/DrClaudeModule.js';
import pool from '../db/pool.js';

async function testDrClaude() {
  console.log('='.repeat(60));
  console.log('TESTING DR CLAUDE MODULE');
  console.log('='.repeat(60));
  
  try {
    // 1. Train padEstimator first
    console.log('\n[Step 1] Training padEstimator...');
    await padEstimator.train();
    
    // 2. Get a test user character
    const userRes = await pool.query(`
      SELECT u.user_id, u.username, u.owned_character_id 
      FROM users u 
      WHERE u.owned_character_id IS NOT NULL 
      LIMIT 1
    `);
    
    if (userRes.rows.length === 0) {
      throw new Error('No users with owned characters found');
    }
    
    const testUser = userRes.rows[0];
    console.log(`\n[Step 2] Testing with user: ${testUser.username} (${testUser.owned_character_id})`);
    
    // 3. Check current PAD
    const beforePad = await pool.query(
      'SELECT p, a, d FROM psychic_moods WHERE character_id = $1',
      [testUser.owned_character_id]
    );
    console.log('\n[Step 3] PAD before:', beforePad.rows[0]);
    
    // 4. Process a happy message
    console.log('\n[Step 4] Processing: "I am so excited and happy about this!"');
    const result1 = await DrClaudeModule.processUserInput(
      'I am so excited and happy about this!',
      testUser.owned_character_id
    );
    console.log('Result:', JSON.stringify(result1, null, 2));
    
    // 5. Check PAD after
    const afterPad = await pool.query(
      'SELECT p, a, d, sample_count FROM psychic_moods WHERE character_id = $1',
      [testUser.owned_character_id]
    );
    console.log('\n[Step 5] PAD after:', afterPad.rows[0]);
    
    // 6. Check event was created
    const eventCheck = await pool.query(
      `SELECT event_id, delta_p, delta_a, delta_d, half_life_seconds 
       FROM psychic_events 
       WHERE target_character = $1 
       ORDER BY created_at DESC LIMIT 1`,
      [testUser.owned_character_id]
    );
    console.log('\n[Step 6] Latest event:', eventCheck.rows[0]);
    
    // 7. Process a sad message
    console.log('\n[Step 7] Processing: "I feel so sad and disappointed"');
    const result2 = await DrClaudeModule.processUserInput(
      'I feel so sad and disappointed',
      testUser.owned_character_id
    );
    console.log('Result:', JSON.stringify(result2, null, 2));
    
    // 8. Final PAD check
    const finalPad = await pool.query(
      'SELECT p, a, d, sample_count FROM psychic_moods WHERE character_id = $1',
      [testUser.owned_character_id]
    );
    console.log('\n[Step 8] Final PAD:', finalPad.rows[0]);
    
    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETE');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n[Test Error]', error);
  } finally {
    await pool.end();
  }
}

testDrClaude();
