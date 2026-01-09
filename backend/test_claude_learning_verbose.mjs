import { getTSELoopManager } from '../TSE/TSELoopManagerSingleton.js';
const tseManager = getTSELoopManager();



























async function testClaudeLearning() {
    try {
        console.log('[TEST] Initializing TSELoopManager...');
        const tseLoopManager = getTSELoopManager();
        await tseLoopManager.initialize();
        console.log('[TEST] ✅ TSELoopManager initialized\n');

        console.log('[TEST] Starting Claude learning cycle...');
        const result = await tseLoopManager.startKnowledgeCycle(
            '#700002',
            'Tell me about the seven commandments',
            'philosophy'
        );

        console.log('\n[TEST] ✅ CYCLE COMPLETE');
        console.log('[TEST] Cycle ID:', result?.cycle?.cycle_id);
        console.log('[TEST] Teacher Record:', result?.teacher?.record_id);
        console.log('[TEST] Student Record:', result?.student?.student_record_id);
        console.log('[TEST] Evaluation Score:', result?.evaluation?.weighted_score);
        
        process.exit(0);
    } catch (error) {
        console.error('\n[TEST] ❌ ERROR:', error.message);
        console.error('[TEST] Code:', error.code);
        console.error('[TEST] Detail:', error.detail);
        process.exit(1);
    }
}

testClaudeLearning();
