import cotwIntentMatcher from './backend/councilTerminal/cotwIntentMatcher.js';
import identityModule from './backend/services/IdentityModule.js';
import pool from './backend/db/pool.js';

// ============================================
// COMPREHENSIVE IDENTITY SYSTEM TEST SUITE
// ============================================

const CLAUDE_CHARACTER_ID = '#700002';

// Test categories
const testResults = {
  patternDetection: { passed: 0, failed: 0, tests: [] },
  patternNonMatch: { passed: 0, failed: 0, tests: [] },
  identityModule: { passed: 0, failed: 0, tests: [] },
  databaseAnchors: { passed: 0, failed: 0, tests: [] },
  edgeCases: { passed: 0, failed: 0, tests: [] }
};

function logTest(category, name, passed, expected, actual, notes = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  testResults[category].tests.push({ name, passed, expected, actual, notes });
  if (passed) {
    testResults[category].passed++;
  } else {
    testResults[category].failed++;
  }
  console.log(`  ${status}: ${name}`);
  if (!passed) {
    console.log(`         Expected: ${expected}`);
    console.log(`         Actual:   ${actual}`);
  }
  if (notes) {
    console.log(`         Note: ${notes}`);
  }
}

// ============================================
// TEST 1: PATTERN DETECTION (Should match SELF_INQUIRY)
// ============================================
async function testPatternDetection() {
  console.log('\n========================================');
  console.log('TEST 1: SELF_INQUIRY Pattern Detection');
  console.log('========================================\n');
  
  const shouldMatch = [
    // Category 1: Identity Assertions
    { input: "you're a bot", category: 'assertion' },
    { input: "you're claude the tanuki", category: 'assertion' },
    { input: "so you're an ai", category: 'assertion' },
    { input: "you are my guide", category: 'assertion' },
    { input: "you're not real", category: 'assertion' },
    
    // Category 2: Explicit Identity
    { input: "who are you", category: 'explicit' },
    { input: "what are you", category: 'explicit' },
    { input: "who are you really", category: 'explicit' },
    { input: "tell me about yourself", category: 'explicit' },
    { input: "tell us about yourself", category: 'explicit' },
    { input: "describe yourself", category: 'explicit' },
    { input: "introduce yourself", category: 'explicit' },
    
    // Category 3: Name & Nature
    { input: "what is your name", category: 'name' },
    { input: "what's your name", category: 'name' },
    { input: "what's your deal", category: 'name' },
    { input: "so who are you then", category: 'name' },
    { input: "claude is what", category: 'name' },
    
    // Category 4: Third-Person
    { input: "who is claude", category: 'third-person' },
    { input: "who is the tanuki", category: 'third-person' },
    { input: "what is claude", category: 'third-person' },
    { input: "tell me about claude", category: 'third-person' },
    { input: "what is this guide", category: 'third-person' },
    
    // Category 5: Capability
    { input: "what can you do", category: 'capability' },
    { input: "what do you do", category: 'capability' },
    { input: "what is your purpose", category: 'capability' },
    { input: "what is your role", category: 'capability' },
    { input: "why do you exist", category: 'capability' },
    
    // Category 6: Origin
    { input: "where are you from", category: 'origin' },
    { input: "where do you come from", category: 'origin' },
    { input: "what is your origin", category: 'origin' },
    { input: "who made you", category: 'origin' },
    { input: "who created you", category: 'origin' },
    
    // Category 7: Nature/Realness
    { input: "are you real", category: 'realness' },
    { input: "are you a bot", category: 'realness' },
    { input: "are you an ai", category: 'realness' },
    { input: "are you a tanuki", category: 'realness' },
    { input: "are you a spirit", category: 'realness' },
    { input: "what are you really", category: 'realness' },
    { input: "are you just a bot", category: 'realness' },
    { input: "is claude real", category: 'realness' },
    
    // Category 8: Rules
    { input: "what are your rules", category: 'rules' },
    { input: "what are your limits", category: 'rules' },
    { input: "what won't you do", category: 'rules' },
    { input: "what can't you do", category: 'rules' },
    
    // Category 9: Deep Inquiry
    { input: "who are you really", category: 'deep' },
    { input: "what are you hiding", category: 'deep' }
  ];
  
  for (const test of shouldMatch) {
    const normalized = test.input.toLowerCase().trim().replace(/[?!.,;:]+$/, '');
    let matchedType = 'NONE';
    
    for (const [intentType, patterns] of Object.entries(cotwIntentMatcher.conversationalPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(normalized)) {
          matchedType = intentType;
          break;
        }
      }
      if (matchedType !== 'NONE') break;
    }
    
    const passed = matchedType === 'SELF_INQUIRY';
    logTest('patternDetection', `"${test.input}" [${test.category}]`, passed, 'SELF_INQUIRY', matchedType);
  }
}

// ============================================
// TEST 2: PATTERN NON-MATCH (Should NOT match SELF_INQUIRY)
// ============================================
async function testPatternNonMatch() {
  console.log('\n========================================');
  console.log('TEST 2: Non-SELF_INQUIRY Patterns');
  console.log('========================================\n');
  
  const shouldNotMatch = [
    { input: "hi", expected: 'GREETING' },
    { input: "hello claude", expected: 'GREETING' },
    { input: "hey", expected: 'GREETING' },
    { input: "good morning", expected: 'GREETING' },
    { input: "thanks", expected: 'GRATITUDE' },
    { input: "thank you", expected: 'GRATITUDE' },
    { input: "bye", expected: 'FAREWELL' },
    { input: "goodbye", expected: 'FAREWELL' },
    { input: "how are you", expected: 'HOW_ARE_YOU' },
    { input: "who is Piza Sukeruton", expected: 'NONE' },
    { input: "what is the cheese wars", expected: 'NONE' },
    { input: "tell me about Pineaple Yurei", expected: 'NONE' },
    { input: "where is the earth realm", expected: 'NONE' },
    { input: "what are you doing tonight", expected: 'NONE' },
    { input: "who are you voting for", expected: 'NONE' },
  ];
  
  for (const test of shouldNotMatch) {
    const normalized = test.input.toLowerCase().trim().replace(/[?!.,;:]+$/, '');
    let matchedType = 'NONE';
    
    for (const [intentType, patterns] of Object.entries(cotwIntentMatcher.conversationalPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(normalized)) {
          matchedType = intentType;
          break;
        }
      }
      if (matchedType !== 'NONE') break;
    }
    
    const passed = matchedType === test.expected;
    logTest('patternNonMatch', `"${test.input}"`, passed, test.expected, matchedType);
  }
}

// ============================================
// TEST 3: IDENTITY MODULE FUNCTIONS
// ============================================
async function testIdentityModule() {
  console.log('\n========================================');
  console.log('TEST 3: IdentityModule Functions');
  console.log('========================================\n');
  
  // Test 3.1: getIdentitySummary
  try {
    const summary = await identityModule.getIdentitySummary(CLAUDE_CHARACTER_ID);
    
    const hasWhoIAm = Array.isArray(summary.whoIAm) && summary.whoIAm.length > 0;
    logTest('identityModule', 'getIdentitySummary returns whoIAm array', hasWhoIAm, 'non-empty array', 
      hasWhoIAm ? `${summary.whoIAm.length} items` : 'empty/missing');
    
    const hasWhatIDo = Array.isArray(summary.whatIDo) && summary.whatIDo.length > 0;
    logTest('identityModule', 'getIdentitySummary returns whatIDo array', hasWhatIDo, 'non-empty array',
      hasWhatIDo ? `${summary.whatIDo.length} items` : 'empty/missing');
    
    const hasWhatIDoNot = Array.isArray(summary.whatIDoNot) && summary.whatIDoNot.length > 0;
    logTest('identityModule', 'getIdentitySummary returns whatIDoNot array', hasWhatIDoNot, 'non-empty array',
      hasWhatIDoNot ? `${summary.whatIDoNot.length} items` : 'empty/missing');
    
    const hasSummary = typeof summary.summary === 'string' && summary.summary.length > 0;
    logTest('identityModule', 'getIdentitySummary returns summary string', hasSummary, 'non-empty string',
      hasSummary ? `"${summary.summary.substring(0, 50)}..."` : 'empty/missing');
    
    // Check content quality
    const mentionsTanuki = summary.whoIAm.some(s => s.toLowerCase().includes('tanuki'));
    logTest('identityModule', 'whoIAm mentions tanuki', mentionsTanuki, 'contains "tanuki"',
      mentionsTanuki ? 'found' : 'not found');
    
    const mentionsClaude = summary.whoIAm.some(s => s.toLowerCase().includes('claude'));
    logTest('identityModule', 'whoIAm mentions Claude', mentionsClaude, 'contains "claude"',
      mentionsClaude ? 'found' : 'not found');
    
  } catch (err) {
    logTest('identityModule', 'getIdentitySummary executes', false, 'no error', err.message);
  }
  
  // Test 3.2: loadIdentityAnchors
  try {
    const anchors = await identityModule.loadIdentityAnchors(CLAUDE_CHARACTER_ID);
    
    const hasAnchors = Array.isArray(anchors) && anchors.length > 0;
    logTest('identityModule', 'loadIdentityAnchors returns anchors', hasAnchors, 'non-empty array',
      hasAnchors ? `${anchors.length} anchors` : 'empty/missing');
    
    if (hasAnchors) {
      const anchorTypes = [...new Set(anchors.map(a => a.anchor_type))];
      const hasMultipleTypes = anchorTypes.length >= 3;
      logTest('identityModule', 'Anchors have multiple types', hasMultipleTypes, '>=3 types',
        `${anchorTypes.length} types: ${anchorTypes.join(', ')}`);
      
      const hasCoreTraits = anchors.some(a => a.anchor_type === 'core_trait');
      logTest('identityModule', 'Has core_trait anchors', hasCoreTraits, 'true', String(hasCoreTraits));
      
      const hasRoles = anchors.some(a => a.anchor_type === 'role');
      logTest('identityModule', 'Has role anchors', hasRoles, 'true', String(hasRoles));
      
      const hasSafety = anchors.some(a => a.anchor_type === 'safety');
      logTest('identityModule', 'Has safety anchors', hasSafety, 'true', String(hasSafety));
    }
  } catch (err) {
    logTest('identityModule', 'loadIdentityAnchors executes', false, 'no error', err.message);
  }
  
  // Test 3.3: buildIdentityContext
  try {
    const context = await identityModule.buildIdentityContext(CLAUDE_CHARACTER_ID, '#D00001', { userInput: 'who are you' });
    
    const hasContext = context && typeof context === 'object';
    logTest('identityModule', 'buildIdentityContext returns object', hasContext, 'object', typeof context);
    
    if (hasContext) {
      const hasAnchorsInContext = context.anchors && Object.keys(context.anchors).length > 0;
      logTest('identityModule', 'Context includes anchors', hasAnchorsInContext, 'has anchors',
        hasAnchorsInContext ? `${Object.keys(context.anchors).length} anchor groups` : 'no anchors');
    }
  } catch (err) {
    logTest('identityModule', 'buildIdentityContext executes', false, 'no error', err.message);
  }
}

// ============================================
// TEST 4: DATABASE ANCHORS
// ============================================
async function testDatabaseAnchors() {
  console.log('\n========================================');
  console.log('TEST 4: Database Anchor Integrity');
  console.log('========================================\n');
  
  try {
    // Count anchors by type
    const result = await pool.query(`
      SELECT anchor_type, COUNT(*) as count 
      FROM identity_anchors 
      WHERE character_id = $1 
      GROUP BY anchor_type 
      ORDER BY anchor_type
    `, [CLAUDE_CHARACTER_ID]);
    
    const typeCounts = {};
    result.rows.forEach(row => {
      typeCounts[row.anchor_type] = parseInt(row.count);
    });
    
    const totalAnchors = Object.values(typeCounts).reduce((a, b) => a + b, 0);
    const hasEnoughAnchors = totalAnchors >= 20;
    logTest('databaseAnchors', 'Total anchors >= 20', hasEnoughAnchors, '>=20', String(totalAnchors));
    
    const hasCoreTraits = (typeCounts.core_trait || 0) >= 5;
    logTest('databaseAnchors', 'core_trait count >= 5', hasCoreTraits, '>=5', String(typeCounts.core_trait || 0));
    
    const hasRoles = (typeCounts.role || 0) >= 3;
    logTest('databaseAnchors', 'role count >= 3', hasRoles, '>=3', String(typeCounts.role || 0));
    
    const hasConstraints = (typeCounts.constraint || 0) >= 3;
    logTest('databaseAnchors', 'constraint count >= 3', hasConstraints, '>=3', String(typeCounts.constraint || 0));
    
    const hasSafety = (typeCounts.safety || 0) >= 2;
    logTest('databaseAnchors', 'safety count >= 2', hasSafety, '>=2', String(typeCounts.safety || 0));
    
    const hasTone = (typeCounts.tone || 0) >= 2;
    logTest('databaseAnchors', 'tone count >= 2', hasTone, '>=2', String(typeCounts.tone || 0));
    
    // Check entrenchment levels
    const entrenchmentResult = await pool.query(`
      SELECT 
        AVG(entrenchment_level) as avg_entrenchment,
        MIN(entrenchment_level) as min_entrenchment,
        MAX(entrenchment_level) as max_entrenchment
      FROM identity_anchors 
      WHERE character_id = $1
    `, [CLAUDE_CHARACTER_ID]);
    
    const avgEntrenchment = parseFloat(entrenchmentResult.rows[0].avg_entrenchment);
    const hasGoodEntrenchment = avgEntrenchment >= 0.8;
    logTest('databaseAnchors', 'Avg entrenchment >= 0.8', hasGoodEntrenchment, '>=0.8', avgEntrenchment.toFixed(2));
    
    // Check for tanuki/folklore grounding
    const folkloreResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM identity_anchors 
      WHERE character_id = $1 
      AND (LOWER(anchor_text) LIKE '%tanuki%' OR LOWER(anchor_text) LIKE '%yokai%' OR LOWER(anchor_text) LIKE '%folklore%')
    `, [CLAUDE_CHARACTER_ID]);
    
    const folkloreCount = parseInt(folkloreResult.rows[0].count);
    const hasFollkloreGrounding = folkloreCount >= 3;
    logTest('databaseAnchors', 'Folklore-grounded anchors >= 3', hasFollkloreGrounding, '>=3', String(folkloreCount));
    
  } catch (err) {
    logTest('databaseAnchors', 'Database queries execute', false, 'no error', err.message);
  }
}

// ============================================
// TEST 5: EDGE CASES & SPECIAL PATTERNS
// ============================================
async function testEdgeCases() {
  console.log('\n========================================');
  console.log('TEST 5: Edge Cases & Special Patterns');
  console.log('========================================\n');
  
  const edgeCases = [
    // With punctuation
    { input: "who are you?", expected: 'SELF_INQUIRY', note: 'with question mark' },
    { input: "who are you!", expected: 'SELF_INQUIRY', note: 'with exclamation' },
    { input: "who are you...", expected: 'SELF_INQUIRY', note: 'with ellipsis' },
    
    // With "Claude" suffix
    { input: "who are you claude", expected: 'SELF_INQUIRY', note: 'with name suffix' },
    { input: "what can you do claude", expected: 'SELF_INQUIRY', note: 'with name suffix' },
    
    // Case variations
    { input: "WHO ARE YOU", expected: 'SELF_INQUIRY', note: 'uppercase' },
    { input: "Who Are You", expected: 'SELF_INQUIRY', note: 'title case' },
    
    // Contractions
    { input: "what's your name", expected: 'SELF_INQUIRY', note: 'contraction' },
    { input: "who're you", expected: 'SELF_INQUIRY', note: 'who are contraction' },
    
    // Prefix combinations (should still work after noise stripping in full pipeline)
    { input: "hey who are you", expected: 'NONE', note: 'greeting prefix - pattern only' },
    { input: "so what are you", expected: 'SELF_INQUIRY', note: '"so" prefix' },
    
    // Near-misses that should NOT match
    { input: "who are you talking to", expected: 'NONE', note: 'extended sentence' },
    { input: "what are you doing", expected: 'NONE', note: 'different verb' },
    { input: "where are you", expected: 'NONE', note: 'location not identity' },
    { input: "how are you", expected: 'HOW_ARE_YOU', note: 'wellbeing not identity' },
  ];
  
  for (const test of edgeCases) {
    const normalized = test.input.toLowerCase().trim().replace(/[?!.,;:]+$/, '');
    let matchedType = 'NONE';
    
    for (const [intentType, patterns] of Object.entries(cotwIntentMatcher.conversationalPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(normalized)) {
          matchedType = intentType;
          break;
        }
      }
      if (matchedType !== 'NONE') break;
    }
    
    const passed = matchedType === test.expected;
    logTest('edgeCases', `"${test.input}"`, passed, test.expected, matchedType, test.note);
  }
}

// ============================================
// SUMMARY REPORT
// ============================================
function printSummary() {
  console.log('\n========================================');
  console.log('           TEST SUMMARY');
  console.log('========================================\n');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const [category, results] of Object.entries(testResults)) {
    const total = results.passed + results.failed;
    const percentage = total > 0 ? Math.round((results.passed / total) * 100) : 0;
    const status = results.failed === 0 ? '✅' : '⚠️';
    
    console.log(`${status} ${category}: ${results.passed}/${total} passed (${percentage}%)`);
    
    totalPassed += results.passed;
    totalFailed += results.failed;
  }
  
  const grandTotal = totalPassed + totalFailed;
  const grandPercentage = Math.round((totalPassed / grandTotal) * 100);
  
  console.log('\n----------------------------------------');
  console.log(`TOTAL: ${totalPassed}/${grandTotal} tests passed (${grandPercentage}%)`);
  console.log('----------------------------------------');
  
  if (totalFailed > 0) {
    console.log('\n❌ FAILED TESTS:');
    for (const [category, results] of Object.entries(testResults)) {
      const failed = results.tests.filter(t => !t.passed);
      if (failed.length > 0) {
        console.log(`\n  [${category}]`);
        failed.forEach(t => {
          console.log(`    - ${t.name}`);
          console.log(`      Expected: ${t.expected}`);
          console.log(`      Actual: ${t.actual}`);
        });
      }
    }
  }
  
  console.log('\n========================================');
  console.log('         END OF TEST REPORT');
  console.log('========================================\n');
}

// ============================================
// RUN ALL TESTS
// ============================================
async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     CLAUDE THE TANUKI - IDENTITY SYSTEM TEST SUITE        ║');
  console.log('║                      v1.0.0                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  try {
    await testPatternDetection();
    await testPatternNonMatch();
    await testIdentityModule();
    await testDatabaseAnchors();
    await testEdgeCases();
    
    printSummary();
  } catch (err) {
    console.error('\n❌ CRITICAL ERROR:', err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runAllTests();
