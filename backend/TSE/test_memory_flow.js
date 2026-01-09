/**
 * Test Script: Student Memory Simulation
 * Tests acquisition → recall flow for Claude (#700002)
 */

import StudentComponent from './StudentComponent.js';
import EvaluatorComponent from './EvaluatorComponent.js';
import pool from '../db/pool.js';

const student = new StudentComponent();
const evaluator = new EvaluatorComponent(pool);

const characterId = '#700002'; // Claude
const knowledgeId = '#AF1A55'; // three_sections

async function runTest() {
  console.log('\n========================================');
  console.log('TSE MEMORY SIMULATION TEST');
  console.log('========================================\n');

  // 1. CHECK INITIAL STATE
  console.log('[1] Checking initial state...');
  const initialState = await student._loadKnowledgeState(characterId, knowledgeId);
  console.log('Initial state:', initialState ? 'EXISTS' : 'NULL (not learned yet)');

  // 2. ACQUISITION PHASE
  console.log('\n[2] Running ACQUISITION...');
  const acquisitionTask = {
    taskId: 'TEST_ACQ_001',
    taskType: 'acquisition',
    concept: 'three_sections',
    required_terms: ['Departure', 'Initiation', 'Return'],
    input: 'The Hero\'s Journey has three major sections: Departure, Initiation, and Return.',
    metadata: { concept: 'three_sections' }
  };

  const acquisitionResult = await student.learn(characterId, knowledgeId, acquisitionTask);
  console.log('Acquisition result:', acquisitionResult.attemptText);
  console.log('Was new acquisition:', acquisitionResult.metadata?.stored);

  // 3. INITIALIZE FSRS ONLY IF NEW ACQUISITION (using metadata flag, not string matching)
  console.log('\n[3] FSRS initialization...');
  if (acquisitionResult.metadata?.stored === true) {
    const fsrsInit = await evaluator.initializeNewItem(characterId, knowledgeId);
    console.log('FSRS init (new item):', fsrsInit);
  } else {
    console.log('FSRS init skipped (already learned)');
  }

  // 4. CHECK STATE AFTER ACQUISITION
  console.log('\n[4] Checking state after acquisition...');
  const afterAcqState = await student._loadKnowledgeState(characterId, knowledgeId);
  console.log('Memory trace:', JSON.stringify(afterAcqState?.memory_trace, null, 2));
  console.log('Acquisition completed:', afterAcqState?.acquisition_completed);
  console.log('Retrievability:', afterAcqState?.current_retrievability);
  console.log('Stability:', afterAcqState?.stability);
  console.log('Difficulty:', afterAcqState?.difficulty);

  // 5. RECALL PHASE
  console.log('\n[5] Running RECALL...');
  const recallTask = {
    taskId: 'TEST_RECALL_001',
    taskType: 'recall',
    concept: 'three_sections',
    required_terms: ['Departure', 'Initiation', 'Return'],
    input: 'What are the three major sections of the Hero\'s Journey?',
    metadata: { concept: 'three_sections' }
  };

  const recallResult = await student.learn(characterId, knowledgeId, recallTask);
  console.log('Recall attempt:', recallResult.attemptText);

  // 6. EVALUATE RECALL
  console.log('\n[6] Evaluating recall...');
  const evaluation = await evaluator._scoreWhiteBeltRecall(
    recallResult.attemptText,
    ['Departure', 'Initiation', 'Return']
  );
  console.log('Score:', evaluation.score);
  console.log('Matched terms:', evaluation.matched_terms);
  console.log('Missing terms:', evaluation.missing_terms);

  // 7. RUN MULTIPLE RECALLS TO SEE VARIATION
  console.log('\n[7] Running 10 more recalls to see variation...');
  for (let i = 0; i < 10; i++) {
    const result = await student.learn(characterId, knowledgeId, recallTask);
    const eval2 = await evaluator._scoreWhiteBeltRecall(
      result.attemptText,
      ['Departure', 'Initiation', 'Return']
    );
    console.log(`  Recall ${i+1}: "${result.attemptText.substring(0, 60)}..." → Score: ${eval2.score}`);
  }

  console.log('\n========================================');
  console.log('TEST COMPLETE');
  console.log('========================================\n');

  await pool.end();
}

runTest().catch(err => {
  console.error('Test failed:', err);
  pool.end();
  process.exit(1);
});
