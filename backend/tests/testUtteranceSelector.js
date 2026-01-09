/**
 * Test script - NEW ClaudeBrain routing (encourage/empathize)
 */

import { selectLtlmUtteranceForBeat } from '../services/ltlmUtteranceSelector.js';
import pool from '../db/pool.js';

const CLAUDE_SPEAKER_ID = '700002';

const testScenarios = [
  {
    name: 'Mixed Emotions (NEW: empathize = 190)',
    params: {
      speakerCharacterId: CLAUDE_SPEAKER_ID,
      speechActCode: 'expressive',
      dialogueFunctionCode: 'expressive.empathize',
      outcomeIntentCode: 'emotional_outcomes.contain_affect',
      targetPad: { pleasure: 0.2, arousal: 0.3, dominance: 0.4 }
    }
  },
  {
    name: 'Positive Emotion (NEW: encourage = 906)',
    params: {
      speakerCharacterId: CLAUDE_SPEAKER_ID,
      speechActCode: 'expressive',
      dialogueFunctionCode: 'expressive.encourage',
      outcomeIntentCode: 'emotional_outcomes.validate_experience',
      targetPad: { pleasure: 0.7, arousal: 0.5, dominance: 0.5 }
    }
  },
  {
    name: 'Negative Emotion (NEW: empathize = 190)',
    params: {
      speakerCharacterId: CLAUDE_SPEAKER_ID,
      speechActCode: 'expressive',
      dialogueFunctionCode: 'expressive.empathize',
      outcomeIntentCode: 'emotional_outcomes.reduce_distress',
      targetPad: { pleasure: -0.5, arousal: -0.4, dominance: -0.2 }
    }
  },
  {
    name: 'User Excited (NEW: encourage = 906)',
    params: {
      speakerCharacterId: CLAUDE_SPEAKER_ID,
      speechActCode: 'expressive',
      dialogueFunctionCode: 'expressive.encourage',
      outcomeIntentCode: 'emotional_outcomes.validate_experience',
      targetPad: { pleasure: 0.8, arousal: 0.8, dominance: 0.6 }
    }
  },
  {
    name: 'Learning Request (unchanged)',
    params: {
      speakerCharacterId: CLAUDE_SPEAKER_ID,
      speechActCode: 'metacommunication.learning_request',
      dialogueFunctionCode: 'metacommunication.learning_request',
      outcomeIntentCode: null,
      targetPad: { pleasure: 0.5, arousal: 0.3, dominance: 0.5 }
    }
  }
];

async function runTests() {
  console.log('='.repeat(80));
  console.log('LTLM TEST - NEW CLAUDEBRAIN ROUTING (encourage/empathize)');
  console.log('='.repeat(80));

  for (const scenario of testScenarios) {
    console.log('-'.repeat(80));
    console.log(`SCENARIO: ${scenario.name}`);
    console.log('-'.repeat(80));

    const uniqueTexts = new Set();
    const results = [];

    for (let i = 1; i <= 5; i++) {
      try {
        const result = await selectLtlmUtteranceForBeat(scenario.params);
        if (result) {
          results.push(result);
          uniqueTexts.add(result.utteranceText);
          console.log(`Run ${i}: Tier=${result.tierUsed} Pool=${result.candidatePoolSize} "${result.utteranceText.substring(0,60)}..."`);
        }
      } catch (err) {
        console.log(`Run ${i}: ERROR - ${err.message}`);
      }
    }

    const avgPool = results.reduce((s,r) => s + r.candidatePoolSize, 0) / results.length;
    console.log(`>>> VARIETY: ${uniqueTexts.size}/5 | AVG POOL: ${avgPool.toFixed(0)}\n`);
  }

  await pool.end();
  console.log('='.repeat(80));
}

runTests().catch(err => { console.error(err); pool.end(); process.exit(1); });
