import pool from './backend/db/pool.js';
import TSELoopManager from './backend/TSE/TSELoopManager.js';

async function runTest() {
    console.log('Testing full TSE Knowledge Cycle...');
    
    try {
        const tseManager = new TSELoopManager(pool);
        await tseManager.initialize();
        
        console.log('Starting knowledge cycle for Claude with storytelling domain...');
        const result = await tseManager.startKnowledgeCycle({
            characterId: '#700002',
            query: null,
            domain: 'story_basics'
        });

        console.log('SUCCESS: Full cycle completed');
        console.log('Cycle ID:', result.cycle.cycle_id);
        console.log('Domain:', result.cycle.domain);
        console.log('Teacher Decision:', result.teacher.algorithm_decision.action);
        console.log('Lesson Name:', result.teacher.instruction_data?.lessonName || 'N/A');
        console.log('Task Name:', result.teacher.instruction_data?.taskName || 'N/A');
        
    } catch (error) {
        console.error('ERROR:', error.message);
        console.error('Stack:', error.stack);
    }
    
    await pool.end();
    process.exit(0);
}

runTest();
