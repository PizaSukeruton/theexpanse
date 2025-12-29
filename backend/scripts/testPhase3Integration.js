import padEstimator from '../services/padEstimator.js';
import DrClaudeModule from '../services/DrClaudeModule.js';
import pool from '../db/pool.js';

async function testPhase3() {
  console.log('='.repeat(60));
  console.log('PHASE 3 INTEGRATION TEST');
  console.log('='.repeat(60));
  
  try {
    // 1. Train padEstimator
    console.log('\n[1] Training padEstimator...');
    await padEstimator.train();
    
    // 2. Get a test user
    const userRes = await pool.query(`
      SELECT u.user_id, u.username, u.owned_character_id,
             pm.p, pm.a, pm.d
      FROM users u
      JOIN psychic_moods pm ON pm.character_id = u.owned_character_id
      WHERE u.owned_character_id IS NOT NULL
      LIMIT 1
    `);
    
    if (userRes.rows.length === 0) {
      throw new Error('No users with PAD data found');
    }
    
    const testUser = userRes.rows[0];
    console.log(`\n[2] Test user: ${testUser.username} (${testUser.owned_character_id})`);
    console.log(`    Current PAD: (${testUser.p}, ${testUser.a}, ${testUser.d})`);
    
    // 3. Get Claude's mood
    const claudeRes = await pool.query(`
      SELECT p, a, d FROM psychic_moods WHERE character_id = '#700002'
    `);
    const claudeMood = claudeRes.rows[0] || { p: 0.5, a: 0.3, d: 0.5 };
    console.log(`\n[3] Claude's mood: (${claudeMood.p}, ${claudeMood.a}, ${claudeMood.d})`);
    
    // 4. Simulate user messages
    const testMessages = [
      "I'm feeling really happy today!",
      "This is frustrating and annoying",
      "Hello",
      "I'm so excited about what we're building!"
    ];
    
    for (const msg of testMessages) {
      console.log(`\n[4] Processing: "${msg}"`);
      
      const result = await DrClaudeModule.processUserInput(msg, testUser.owned_character_id);
      
      if (result.skipped) {
        console.log(`    Skipped: ${result.reason}`);
      } else {
        console.log(`    Detected PAD: (${result.detectedPad.p.toFixed(3)}, ${result.detectedPad.a.toFixed(3)}, ${result.detectedPad.d.toFixed(3)})`);
        console.log(`    Updated PAD:  (${result.updatedPad.p.toFixed(3)}, ${result.updatedPad.a.toFixed(3)}, ${result.updatedPad.d.toFixed(3)})`);
        console.log(`    Half-life: ${result.halfLife}s`);
        console.log(`    Event: ${result.eventId}`);
      }
    }
    
    // 5. Check final state
    const finalRes = await pool.query(`
      SELECT p, a, d, sample_count FROM psychic_moods WHERE character_id = $1
    `, [testUser.owned_character_id]);
    
    console.log(`\n[5] Final PAD: (${finalRes.rows[0].p}, ${finalRes.rows[0].a}, ${finalRes.rows[0].d})`);
    console.log(`    Sample count: ${finalRes.rows[0].sample_count}`);
    
    // 6. Check events created
    const eventsRes = await pool.query(`
      SELECT COUNT(*) as count FROM psychic_events 
      WHERE target_character = $1 
      AND created_at > NOW() - INTERVAL '5 minutes'
    `, [testUser.owned_character_id]);
    
    console.log(`\n[6] Events created in last 5 min: ${eventsRes.rows[0].count}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('PHASE 3 TEST COMPLETE');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n[ERROR]', error);
  } finally {
    await pool.end();
  }
}

testPhase3();
