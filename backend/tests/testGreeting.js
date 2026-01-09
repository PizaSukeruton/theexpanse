import { selectLtlmUtteranceForBeat } from '../services/ltlmUtteranceSelector.js';
import pool from '../db/pool.js';

async function test() {
  console.log('Testing GREETING selection:\n');
  
  for (let i = 1; i <= 5; i++) {
    const result = await selectLtlmUtteranceForBeat({
      speakerCharacterId: '700002',
      speechActCode: 'assertive.describe',
      dialogueFunctionCode: 'social_obligations_management.greet',
      outcomeIntentCode: null,
      targetPad: { pleasure: 0.3, arousal: 0.2, dominance: 0.1 }
    });
    
    console.log(`Run ${i}: Tier=${result?.tierUsed} Pool=${result?.candidatePoolSize}`);
    console.log(`  "${result?.utteranceText?.substring(0, 70)}..."\n`);
  }
  
  await pool.end();
}

test();
