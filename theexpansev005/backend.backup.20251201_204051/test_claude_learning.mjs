import pool from './db/pool.js';
import TSELoopManager from './TSE/TSELoopManager.js';
import LearningDatabase from './TSE/LearningDatabase.js';

async function testClaudeLearning() {
    const learningDb = new LearningDatabase(pool);
    const tseManager = new TSELoopManager(pool);
    
    try {
        await tseManager.initialize();
        
        console.log('[TEST] Starting Claude learning cycle...\n');
        
        const result = await tseManager.startKnowledgeCycle({
            characterId: '#700002',
            query: 'How do tanuki learn best?',
            domain: 'story_sense'
        });
        
        console.log('\n[TEST] CYCLE COMPLETE');
        console.log('Cycle ID:', result.cycle.cycle_id);
        console.log('Evaluation Score:', result.evaluation.weighted_score);
        console.log('Belt Progress:', result.belt_progression);
        
        process.exit(0);
    } catch (error) {
        console.error('[TEST] Error:', error);
        process.exit(1);
    }
}

testClaudeLearning();
