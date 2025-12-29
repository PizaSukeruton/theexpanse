import cotwIntentMatcher from './backend/councilTerminal/cotwIntentMatcher.js';
import identityModule from './backend/services/IdentityModule.js';
import pool from './backend/db/pool.js';

// ============================================
// IDENTITY RESPONSE TEST SUITE
// Tests the full response generation pipeline
// ============================================

const CLAUDE_CHARACTER_ID = '#700002';

const testQueries = [
  'who are you',
  'what are you', 
  'tell me about yourself',
  'what is your name',
  'are you real',
  'what can you do',
  'who made you',
  'what are your rules',
  'who is claude',
  'are you a tanuki'
];

async function testResponses() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   CLAUDE THE TANUKI - IDENTITY RESPONSE TEST SUITE        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // First get the identity summary to see what we're working with
  console.log('========================================');
  console.log('IDENTITY SUMMARY (Raw Data)');
  console.log('========================================\n');
  
  try {
    const summary = await identityModule.getIdentitySummary(CLAUDE_CHARACTER_ID);
    
    console.log('whoIAm (core_trait):');
    summary.whoIAm.forEach((text, i) => console.log(`  ${i+1}. ${text}`));
    
    console.log('\nwhatIDo (role):');
    summary.whatIDo.forEach((text, i) => console.log(`  ${i+1}. ${text}`));
    
    console.log('\nwhatIDoNot (constraint):');
    summary.whatIDoNot.forEach((text, i) => console.log(`  ${i+1}. ${text}`));
    
    console.log('\nsummary:', summary.summary);
    console.log('\nanchorCounts:', summary.anchorCounts);
    
  } catch (err) {
    console.error('Error getting identity summary:', err.message);
  }

  console.log('\n========================================');
  console.log('SIMULATED RESPONSES');
  console.log('========================================\n');

  for (const query of testQueries) {
    console.log(`┌─────────────────────────────────────────`);
    console.log(`│ USER: "${query}"`);
    console.log(`├─────────────────────────────────────────`);
    
    try {
      // Step 1: Match intent
      const normalized = query.toLowerCase().trim().replace(/[?!.,;:]+$/, '');
      let intentType = 'NONE';
      let mapping = null;
      
      for (const [type, patterns] of Object.entries(cotwIntentMatcher.conversationalPatterns)) {
        for (const pattern of patterns) {
          if (pattern.test(normalized)) {
            intentType = type;
            mapping = cotwIntentMatcher.conversationalMappings[type];
            break;
          }
        }
        if (intentType !== 'NONE') break;
      }
      
      console.log(`│ Intent: ${intentType}`);
      
      if (intentType === 'SELF_INQUIRY') {
        // Step 2: Get identity summary
        const summary = await identityModule.getIdentitySummary(CLAUDE_CHARACTER_ID);
        
        // Step 3: Build response (mimics ClaudeBrain logic)
        const coreIdentity = summary.whoIAm[0] || "I am Claude the Tanuki.";
        const roleIdentity = summary.whatIDo[0] || "";
        
        const response = roleIdentity 
          ? `${coreIdentity} ${roleIdentity}`
          : coreIdentity;
        
        console.log(`│ Source: identity`);
        console.log(`│`);
        console.log(`│ CLAUDE: "${response}"`);
        console.log(`│`);
        console.log(`│ [Debug] Used anchors:`);
        console.log(`│   - whoIAm[0]: "${summary.whoIAm[0]?.substring(0, 60)}..."`);
        console.log(`│   - whatIDo[0]: "${summary.whatIDo[0]?.substring(0, 60)}..."`);
      } else {
        console.log(`│ Source: (would use LTLM or entity search)`);
        console.log(`│ CLAUDE: [Not an identity question - different handler]`);
      }
      
    } catch (err) {
      console.log(`│ ERROR: ${err.message}`);
    }
    
    console.log(`└─────────────────────────────────────────\n`);
  }

  // Show all available anchor text for reference
  console.log('========================================');
  console.log('ALL IDENTITY ANCHORS (Full Text)');
  console.log('========================================\n');
  
  try {
    const result = await pool.query(`
      SELECT anchor_id, anchor_type, anchor_text, entrenchment_level, confidence
      FROM identity_anchors 
      WHERE character_id = $1 
      ORDER BY anchor_type, entrenchment_level DESC
    `, [CLAUDE_CHARACTER_ID]);
    
    let currentType = '';
    for (const row of result.rows) {
      if (row.anchor_type !== currentType) {
        currentType = row.anchor_type;
        console.log(`\n[${currentType.toUpperCase()}]`);
      }
      console.log(`  ${row.anchor_id} (e=${row.entrenchment_level}, c=${row.confidence})`);
      console.log(`    "${row.anchor_text}"`);
    }
  } catch (err) {
    console.error('Error fetching anchors:', err.message);
  }

  console.log('\n========================================');
  console.log('         END OF RESPONSE TEST');
  console.log('========================================\n');
  
  await pool.end();
  process.exit(0);
}

testResponses();
