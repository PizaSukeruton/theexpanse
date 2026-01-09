const TSELoopManager = require('./TSELoopManager.js').default;

async function testTseSession() {
  const characterId = '#700002';
  const query = 'Learn about communication';
  const options = { maxTasks: 3 };

  console.log('[TEST] Starting TSE session');
  console.log('[TEST] Character ID:', characterId);
  console.log('[TEST] Query:', query);
  console.log('[TEST] Options:', options);

  try {
    const tse = new TSELoopManager();
    const result = await tse.runOrContinueTseSession(characterId, query, null, null, options);

    console.log('[TEST] Session completed successfully');
    console.log('[TEST] Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('[TEST] Error:', err.message);
    console.error('[TEST] Stack:', err.stack);
  }

  process.exit(0);
}

testTseSession();
