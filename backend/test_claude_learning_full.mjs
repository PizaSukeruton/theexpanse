import { getTSELoopManager } from '../TSE/TSELoopManagerSingleton.js';
const tseManager = getTSELoopManager();



























async function testClaudeLearning() {
    try {
        console.log('[TEST] Initializing TSELoopManager...');
        const tseLoopManager = getTSELoopManager();
        await tseLoopManager.initialize();
        console.log('[TEST] ✅ TSELoopManager initialized\n');

        console.log('[TEST] Starting Claude learning cycle...');
        
        const result = await tseLoopManager.startKnowledgeCycle({
            characterId: '#700002',
            query: 'Tell me about the seven commandments',
            domain: 'story_basics'
        });

        console.log('\n[TEST] ✅ CYCLE COMPLETE');
        console.log('[TEST] Full Result:', JSON.stringify(result, null, 2));
        
        if (result && result.cycle) {
            console.log('\n[TEST] Summary:');
            console.log('  Cycle ID:', result.cycle.cycle_id);
            console.log('  Domain:', result.cycle.domain);
            console.log('  Teacher Record:', result.teacher?.record_id);
            console.log('  Student Record:', result.student?.student_record_id);
            console.log('  Weighted Score:', result.evaluation?.weighted_score);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('\n[TEST] ❌ ERROR:', error.message);
        console.error('[TEST] Stack:', error.stack);
        process.exit(1);
    }
}

testClaudeLearning();
