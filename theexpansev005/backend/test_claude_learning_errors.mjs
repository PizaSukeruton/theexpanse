import TSELoopManager from './TSE/TSELoopManager.js';
import pool from './db/pool.js';

async function testClaudeLearning() {
    let client;
    try {
        console.log('[TEST] Initializing TSELoopManager...');
        const tseLoopManager = new TSELoopManager(pool);
        await tseLoopManager.initialize();
        console.log('[TEST] ✅ TSELoopManager initialized\n');

        console.log('[TEST] Starting Claude learning cycle...');
        
        // Manually step through to see where it fails
        client = await pool.connect();
        await client.query('BEGIN');
        
        const cycle_id = '#800016';
        const characterId = '#700002';
        const query = 'Tell me about the seven commandments';
        const domain = 'story_basics';
        
        console.log('[TEST] Creating cycle:', cycle_id);
        
        const cycleQuery = `
            INSERT INTO tse_cycles (
                cycle_id, cycle_type, status, cultural_compliance
            ) VALUES ($1, $2, $3, $4)
        `;
        
        await client.query(cycleQuery, [
            cycle_id,
            'knowledge_learning',
            'running',
            { domain, module: domain, startTime: new Date().toISOString() }
        ]);
        
        console.log('[TEST] ✅ Cycle created');
        console.log('[TEST] Creating teacher records...');
        
        const teacherData = await tseLoopManager.teacherComponent.handleKnowledgeCycle(cycle_id, characterId, query, domain, client);
        console.log('[TEST] ✅ Teacher records created:', teacherData.record_id);
        
        console.log('[TEST] Creating student records...');
        const studentData = await tseLoopManager.studentComponent.handleKnowledgeCycle(
            cycle_id,
            characterId,
            teacherData.algorithm_decision.taskTypeId,
            teacherData.record_id,
            client
        );
        console.log('[TEST] ✅ Student records created:', studentData.student_record_id);
        
        await client.query('COMMIT');
        console.log('[TEST] ✅ Transaction committed');
        
        process.exit(0);
    } catch (error) {
        if (client) await client.query('ROLLBACK').catch(() => {});
        console.error('\n[TEST] ❌ ERROR:', error.message);
        console.error('[TEST] Code:', error.code);
        console.error('[TEST] Detail:', error.detail);
        console.error('[TEST] Stack:', error.stack);
        process.exit(1);
    } finally {
        if (client) client.release();
    }
}

testClaudeLearning();
