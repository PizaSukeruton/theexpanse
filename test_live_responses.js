import claudeBrain from './backend/councilTerminal/ClaudeBrain.js';
import pool from './backend/db/pool.js';

// ============================================
// LIVE RESPONSE TEST - Simulating Terminal
// Calls ClaudeBrain directly with James3's account
// ============================================

// Real user: James3 - EXACTLY AS IN DATABASE
const realUser = {
  user_id: '#D0000A',
  access_level: 1,
  username: 'James3'
};

const mockSession = {
  context: {},
  userId: '#D0000A'
};

const testQueries = [
  'who are you',
  'what are you',
  'what can you do',
  'what is your purpose',
  'what are your rules',
  'what are your limits',
  'where are you from',
  'who made you',
  'are you real',
  'are you a tanuki',
  'what is your name',
  'who is claude',
  "you're a bot",
  'who are you really'
];

async function runLiveTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      LIVE RESPONSE TEST - ClaudeBrain Direct Calls        ║');
  console.log('║           User: James3 (#D0000A) - Access Level 1         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  for (const query of testQueries) {
    console.log('┌─────────────────────────────────────────────────────────────');
    console.log(`│ JAMES3: "${query}"`);
    console.log('├─────────────────────────────────────────────────────────────');
    
    try {
      const result = await claudeBrain.processQuery(query, mockSession, realUser);
      
      if (result.success) {
        console.log(`│ Source: ${result.source || 'unknown'}`);
        console.log(`│`);
        console.log(`│ CLAUDE: "${result.output}"`);
      } else {
        console.log(`│ ERROR: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.log(`│ EXCEPTION: ${err.message}`);
    }
    
    console.log('└─────────────────────────────────────────────────────────────\n');
  }

  // Summary comparison
  console.log('========================================');
  console.log('RESPONSE COMPARISON TABLE');
  console.log('========================================\n');
  
  console.log('Query                        | Source       | Response (first 50 chars)');
  console.log('-----------------------------|--------------|----------------------------------');
  
  for (const query of testQueries) {
    try {
      const result = await claudeBrain.processQuery(query, { context: {} }, realUser);
      const q = query.padEnd(28);
      const source = (result.source || 'N/A').padEnd(12);
      const response = result.output?.substring(0, 45) || 'N/A';
      console.log(`${q} | ${source} | ${response}...`);
    } catch (err) {
      console.log(`${query.padEnd(28)} | ERROR        | ${err.message.substring(0, 30)}`);
    }
  }

  console.log('\n========================================');
  console.log('         END OF LIVE TEST');
  console.log('========================================\n');
  
  await pool.end();
  process.exit(0);
}

runLiveTests();
