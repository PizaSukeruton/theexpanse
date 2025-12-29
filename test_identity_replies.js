import cotwIntentMatcher from './backend/councilTerminal/cotwIntentMatcher.js';
import identityModule from './backend/services/IdentityModule.js';
import pool from './backend/db/pool.js';

// ============================================
// IDENTITY RESPONSE TEST - ACTUAL REPLIES
// Shows what Claude would say for each question
// ============================================

const CLAUDE_CHARACTER_ID = '#700002';

// Simulate what ClaudeBrain does
async function simulateClaudeResponse(query) {
  const normalized = query.toLowerCase().trim().replace(/[?!.,;:]+$/, '');
  const intentResult = cotwIntentMatcher.matchConversationalIntent(normalized);
  
  if (!intentResult || intentResult.type !== 'SELF_INQUIRY') {
    return {
      query,
      matched: false,
      intentType: intentResult?.type || 'NONE',
      response: '[Not an identity question - would use different handler]'
    };
  }
  
  // Get identity summary
  const summary = await identityModule.getIdentitySummary(CLAUDE_CHARACTER_ID);
  
  // Current simple logic (what ClaudeBrain does now)
  const coreIdentity = summary.whoIAm[0] || "I am Claude the Tanuki.";
  const roleIdentity = summary.whatIDo[0] || "";
  const currentResponse = roleIdentity 
    ? `${coreIdentity} ${roleIdentity}`
    : coreIdentity;
  
  // ENHANCED logic based on subtype (what we SHOULD do)
  let enhancedResponse;
  let anchorType;
  
  switch (intentResult.subtype) {
    case 'IDENTITY':
      anchorType = 'core_trait';
      enhancedResponse = summary.whoIAm[0];
      break;
      
    case 'CAPABILITY':
      anchorType = 'role';
      enhancedResponse = summary.whatIDo[0] || summary.whatIDo[1];
      break;
      
    case 'RULES':
      anchorType = 'constraint';
      enhancedResponse = summary.whatIDoNot[0];
      break;
      
    case 'ORIGIN':
      anchorType = 'core_trait (origin)';
      // Would need origin-specific anchor, using core_trait for now
      enhancedResponse = "I dwell in the Earth Realm, drawn here during the Cheese Wars. My roots lie in the spirit world, among the yokai.";
      break;
      
    case 'NATURE':
      anchorType = 'core_trait (nature)';
      enhancedResponse = summary.whoIAm.find(a => a.includes('bake-danuki') || a.includes('yokai')) || summary.whoIAm[1];
      break;
      
    case 'NAME':
      anchorType = 'core_trait (name)';
      enhancedResponse = "I am Claude the Tanuki.";
      break;
      
    case 'THIRD_PERSON':
      anchorType = 'core_trait';
      enhancedResponse = summary.whoIAm[0]?.replace('I am', 'Claude is').replace('I ', 'He ');
      break;
      
    case 'ASSERTION':
      anchorType = 'constraint/safety';
      enhancedResponse = summary.whatIDoNot[0] || "I am who I am — no more, no less.";
      break;
      
    case 'DEEPER':
      anchorType = 'core_trait + constraint';
      enhancedResponse = `${summary.whoIAm[0]} ${summary.whatIDoNot[0]}`;
      break;
      
    default:
      anchorType = 'core_trait';
      enhancedResponse = summary.whoIAm[0];
  }
  
  return {
    query,
    matched: true,
    intentType: 'SELF_INQUIRY',
    subtype: intentResult.subtype,
    anchorType,
    currentResponse,
    enhancedResponse,
    allAnchors: {
      whoIAm: summary.whoIAm,
      whatIDo: summary.whatIDo,
      whatIDoNot: summary.whatIDoNot
    }
  };
}

async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    CLAUDE THE TANUKI - ACTUAL RESPONSE TEST               ║');
  console.log('║         What Claude Says for Each Question                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Group questions by subtype
  const testGroups = {
    'IDENTITY (Core Questions)': [
      'who are you',
      'what are you',
      'tell me about yourself',
      'describe yourself'
    ],
    'CAPABILITY (What You Do)': [
      'what can you do',
      'what do you do',
      'what is your purpose',
      'what is your role',
      'why do you exist'
    ],
    'RULES (Constraints)': [
      'what are your rules',
      'what are your limits',
      "what won't you do",
      "what can't you do"
    ],
    'ORIGIN (Where From)': [
      'where are you from',
      'where do you come from',
      'who made you',
      'who created you',
      'what is your origin'
    ],
    'NATURE (What Kind)': [
      'are you real',
      'are you a bot',
      'are you a tanuki',
      'what are you really',
      'what kind of creature are you'
    ],
    'NAME (Identity)': [
      'what is your name',
      "what's your name",
      "what's your deal"
    ],
    'THIRD_PERSON (About Claude)': [
      'who is claude',
      'what is claude',
      'who is the tanuki',
      'tell me about claude'
    ],
    'ASSERTION (Statements)': [
      "you're a bot",
      "you're an ai",
      "you're not real",
      'so you are a tanuki'
    ],
    'DEEPER (Existential)': [
      'who are you really',
      'what are you hiding'
    ]
  };

  for (const [groupName, queries] of Object.entries(testGroups)) {
    console.log('========================================');
    console.log(groupName);
    console.log('========================================\n');
    
    for (const query of queries) {
      const result = await simulateClaudeResponse(query);
      
      console.log(`┌─────────────────────────────────────────────────────────────`);
      console.log(`│ USER: "${query}"`);
      console.log(`├─────────────────────────────────────────────────────────────`);
      
      if (result.matched) {
        console.log(`│ Subtype: ${result.subtype}`);
        console.log(`│ Anchor Type: ${result.anchorType}`);
        console.log(`│`);
        console.log(`│ CURRENT RESPONSE (same for all):`);
        console.log(`│   "${result.currentResponse.substring(0, 80)}${result.currentResponse.length > 80 ? '...' : ''}"`);
        console.log(`│`);
        console.log(`│ ENHANCED RESPONSE (subtype-specific):`);
        console.log(`│   "${result.enhancedResponse?.substring(0, 80)}${result.enhancedResponse?.length > 80 ? '...' : ''}"`);
      } else {
        console.log(`│ Intent: ${result.intentType}`);
        console.log(`│ ${result.response}`);
      }
      
      console.log(`└─────────────────────────────────────────────────────────────\n`);
    }
  }

  // Show comparison summary
  console.log('========================================');
  console.log('COMPARISON: CURRENT vs ENHANCED');
  console.log('========================================\n');
  
  const comparisonQueries = [
    'who are you',
    'what can you do',
    'what are your rules',
    'where are you from',
    'are you real',
    "what's your name",
    'who is claude',
    "you're a bot",
    'who are you really'
  ];
  
  console.log('Question                     | Current Response (truncated)       | Enhanced Response (truncated)');
  console.log('-----------------------------|------------------------------------|---------------------------------');
  
  for (const query of comparisonQueries) {
    const result = await simulateClaudeResponse(query);
    if (result.matched) {
      const current = result.currentResponse.substring(0, 32).padEnd(34);
      const enhanced = result.enhancedResponse?.substring(0, 32) || 'N/A';
      const q = query.padEnd(28);
      console.log(`${q} | ${current} | ${enhanced}`);
    }
  }

  // Show all available anchors
  console.log('\n========================================');
  console.log('ALL AVAILABLE ANCHORS BY TYPE');
  console.log('========================================\n');
  
  const anchors = await identityModule.loadIdentityAnchors(CLAUDE_CHARACTER_ID);
  
  const byType = {};
  anchors.forEach(a => {
    if (!byType[a.anchor_type]) byType[a.anchor_type] = [];
    byType[a.anchor_type].push(a);
  });
  
  for (const [type, list] of Object.entries(byType)) {
    console.log(`[${type.toUpperCase()}] (${list.length} anchors)`);
    list.forEach((a, i) => {
      console.log(`  ${i+1}. "${a.anchor_text.substring(0, 70)}${a.anchor_text.length > 70 ? '...' : ''}"`);
    });
    console.log('');
  }

  console.log('========================================');
  console.log('         END OF RESPONSE TEST');
  console.log('========================================\n');
  
  await pool.end();
  process.exit(0);
}

runTests();
