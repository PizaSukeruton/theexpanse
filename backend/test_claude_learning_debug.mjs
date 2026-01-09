import { getTSELoopManager } from '../TSE/TSELoopManagerSingleton.js';
const tseManager = getTSELoopManager();



























async function testClaudeLearning() {
    try {
        const tseLoopManager = getTSELoopManager();
        await tseLoopManager.initialize();

        console.log('[TEST] Starting Claude learning cycle...\n');

        const result = await tseLoopManager.startKnowledgeCycle(
            '#700002',
            'Tell me about the seven commandments',
            'philosophy'
        );

        console.log('\n[TEST] ✅ CYCLE COMPLETE');
        console.log('[TEST] Result:', JSON.stringify(result, null, 2));
        
        process.exit(0);
    } catch (error) {
        console.error('[TEST] Error:', error.message);
        console.error('[TEST] Stack:', error.stack);
        process.exit(1);
    }
}

testClaudeLearning();
