// test-student-recall.js
// Tests that StudentComponent correctly retrieves answers from database for recall tasks

import pool from '../db/pool.js';

async function testStudentRecall() {
  console.log('='.repeat(60));
  console.log('TEST: StudentComponent Recall Functionality');
  console.log('='.repeat(60));

  try {
    // Step 1: Import StudentComponent
    console.log('\n[1] Loading StudentComponent...');
    const { default: StudentComponent } = await import('./StudentComponent.js');
    const student = new StudentComponent();
    await student.initialize();
    console.log('    ✓ StudentComponent loaded');

    // Step 2: Get a Hero's Journey knowledge item from database
    console.log('\n[2] Fetching Hero\'s Journey knowledge item from DB...');
    const knowledgeResult = await pool.query(`
      SELECT knowledge_id, concept, answer_statement, content
      FROM knowledge_items 
      WHERE domain_id = '#AE0008' 
        AND answer_statement IS NOT NULL
      LIMIT 1
    `);

    if (knowledgeResult.rows.length === 0) {
      console.log('    ✗ No Hero\'s Journey items found with answer_statement');
      console.log('    → Run: SELECT knowledge_id, answer_statement FROM knowledge_items WHERE domain_id = \'#AE0008\' LIMIT 5;');
      await pool.end();
      return;
    }

    const item = knowledgeResult.rows[0];
    console.log(`    ✓ Found: ${item.knowledge_id} - ${item.concept || 'no concept'}`);
    console.log(`    → answer_statement: "${(item.answer_statement || '').substring(0, 80)}..."`);

    // Step 3: Create a recall task
    console.log('\n[3] Creating recall task...');
    const task = {
      taskId: '#TEST001',
      taskType: 'recall',
      input: 'What are the three major sections of the Hero\'s Journey?',
      metadata: {}
    };
    console.log(`    → taskType: ${task.taskType}`);
    console.log(`    → input: "${task.input}"`);

    // Step 4: Call student.learn() with the recall task
    console.log('\n[4] Calling student.learn()...');
    const characterId = '#700002';
    const knowledgeId = item.knowledge_id;

    const result = await student.learn(characterId, knowledgeId, task, null);

    console.log('\n[5] RESULT:');
    console.log('    → attemptId:', result.attemptId);
    console.log('    → attemptText:', result.attemptText);
    console.log('    → isRealInput:', result.metadata?.isRealInput);

    // Step 5: Verify the response contains actual knowledge
    console.log('\n[6] VERIFICATION:');
    
    const hasRecallPrefix = result.attemptText.startsWith('I recall:');
    console.log(`    → Starts with "I recall:": ${hasRecallPrefix ? '✓ YES' : '✗ NO'}`);

    const echoedQuestion = result.attemptText.includes('What are the three');
    console.log(`    → Echoed the question (BAD): ${echoedQuestion ? '✗ YES - BROKEN' : '✓ NO - GOOD'}`);

    // Check for Hero's Journey terms
    const hasDeparture = result.attemptText.toLowerCase().includes('departure');
    const hasInitiation = result.attemptText.toLowerCase().includes('initiation');
    const hasReturn = result.attemptText.toLowerCase().includes('return');
    
    console.log(`    → Contains "Departure": ${hasDeparture ? '✓ YES' : '✗ NO'}`);
    console.log(`    → Contains "Initiation": ${hasInitiation ? '✓ YES' : '✗ NO'}`);
    console.log(`    → Contains "Return": ${hasReturn ? '✓ YES' : '✗ NO'}`);

    const score = [hasDeparture, hasInitiation, hasReturn].filter(Boolean).length;
    console.log(`\n    SCORE: ${score}/3 required terms found`);

    // Final verdict
    console.log('\n' + '='.repeat(60));
    if (score === 3 && !echoedQuestion) {
      console.log('✓ TEST PASSED: StudentComponent correctly recalls stored knowledge');
    } else if (echoedQuestion) {
      console.log('✗ TEST FAILED: StudentComponent is echoing the question instead of recalling');
    } else {
      console.log(`⚠ TEST PARTIAL: Only ${score}/3 terms found in response`);
      console.log('  → Check answer_statement in knowledge_items table');
    }
    console.log('='.repeat(60));

  } catch (err) {
    console.error('\n✗ TEST ERROR:', err.message);
    console.error(err.stack);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testStudentRecall();
