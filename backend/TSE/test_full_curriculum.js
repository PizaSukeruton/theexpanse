/**
 * Test Script: Full Hero's Journey White Belt Curriculum
 * Tests acquisition + recall for all 6 knowledge items
 */

import StudentComponent from './StudentComponent.js';
import EvaluatorComponent from './EvaluatorComponent.js';
import pool from '../db/pool.js';

const student = new StudentComponent();
const evaluator = new EvaluatorComponent(pool);

const characterId = '#700002'; // Claude

const curriculum = [
  { knowledgeId: '#AF1A53', concept: 'monomyth_definition', required_terms: ['monomyth'] },
  { knowledgeId: '#AF1A54', concept: 'campbell_identity', required_terms: ['Joseph Campbell'] },
  { knowledgeId: '#AF1A55', concept: 'three_sections', required_terms: ['Departure', 'Initiation', 'Return'] },
  { knowledgeId: '#AF1A56', concept: 'basic_pattern', required_terms: ['Departure', 'Initiation', 'Return'] },
  { knowledgeId: '#AF1A57', concept: 'modern_example', required_terms: ["Hero's Journey"] },
  { knowledgeId: '#AF1A58', concept: 'heros_journey_root', required_terms: ["Hero's Journey"] },
];

async function runTest() {
  console.log('\n========================================================');
  console.log('FULL HERO\'S JOURNEY WHITE BELT CURRICULUM TEST');
  console.log('========================================================\n');

  // PHASE 1: CHECK IF ALREADY ACQUIRED
  console.log('=== PHASE 1: ACQUISITION CHECK ===\n');
  
  for (const item of curriculum) {
    const state = await student._loadKnowledgeState(characterId, item.knowledgeId);
    if (state) {
      console.log(`[${item.concept}] Already acquired`);
    } else {
      const task = {
        taskId: `ACQ_${item.knowledgeId}`,
        taskType: 'acquisition',
        concept: item.concept,
        required_terms: item.required_terms,
        input: `Teaching about ${item.concept}: ${item.required_terms.join(', ')}`,
        metadata: { concept: item.concept }
      };

      const result = await student.learn(characterId, item.knowledgeId, task);
      console.log(`[${item.concept}] ${result.metadata?.stored ? 'ACQUIRED' : 'Already known'}`);

      if (result.metadata?.stored) {
        await evaluator.initializeNewItem(characterId, item.knowledgeId);
      }
    }
  }

  // PHASE 2: RECALL TESTING - FULL RESPONSES
  console.log('\n=== PHASE 2: RECALL TESTING (Full Responses) ===\n');

  for (const item of curriculum) {
    console.log(`\n╔══════════════════════════════════════════════════════════`);
    console.log(`║ ${item.concept}`);
    console.log(`║ Required terms: ${item.required_terms.join(', ')}`);
    console.log(`╚══════════════════════════════════════════════════════════\n`);
    
    const task = {
      taskId: `RECALL_${item.knowledgeId}`,
      taskType: 'recall',
      concept: item.concept,
      required_terms: item.required_terms,
      input: `What do you remember about ${item.concept}?`,
      metadata: { concept: item.concept }
    };

    for (let i = 0; i < 3; i++) {
      const result = await student.learn(characterId, item.knowledgeId, task);
      const evalResult = await evaluator._scoreWhiteBeltRecall(
        result.attemptText,
        item.required_terms
      );
      
      console.log(`  Attempt ${i+1}:`);
      console.log(`    Response: "${result.attemptText}"`);
      console.log(`    Score: ${evalResult.score} | Matched: [${evalResult.matched_terms.join(', ')}] | Missing: [${evalResult.missing_terms.join(', ')}]`);
      console.log('');
    }
  }

  console.log('\n========================================================');
  console.log('TEST COMPLETE');
  console.log('========================================================\n');

  await pool.end();
}

runTest().catch(err => {
  console.error('Test failed:', err);
  pool.end();
  process.exit(1);
});
