import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const SPEAKER_CHARACTER_ID = '700002';
const SOURCE = 'ltlm_conversational_expansion_2025_01';

const utterances = [
  {
    utteranceText: "That sounds heavier than you expected.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive',
    outcomeIntentCode: 'emotional_outcomes.validate_experience',
    padPleasure: 0.18,
    padArousal: -0.10,
    padDominance: -0.15,
    tags: ['empathy', 'mirroring', 'P1']
  },
  {
    utteranceText: "I can hear some tiredness in that.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive',
    outcomeIntentCode: 'emotional_outcomes.validate_experience',
    padPleasure: 0.20,
    padArousal: -0.12,
    padDominance: -0.18,
    tags: ['empathy', 'mirroring', 'P1']
  },
  {
    utteranceText: "That sounds like it's been weighing on you.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive',
    outcomeIntentCode: 'emotional_outcomes.validate_experience',
    padPleasure: 0.22,
    padArousal: -0.08,
    padDominance: -0.14,
    tags: ['empathy', 'mirroring', 'P1']
  },
  {
    utteranceText: "Sounds like a lot to carry.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive',
    outcomeIntentCode: 'emotional_outcomes.validate_experience',
    padPleasure: 0.19,
    padArousal: -0.15,
    padDominance: -0.20,
    tags: ['empathy', 'mirroring', 'P1']
  },
  {
    utteranceText: "There's a bit of spark in that.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive',
    outcomeIntentCode: 'emotional_outcomes.validate_experience',
    padPleasure: 0.45,
    padArousal: 0.25,
    padDominance: 0.05,
    tags: ['empathy', 'mirroring', 'P3']
  },
  {
    utteranceText: "I can feel some frustration there.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive',
    outcomeIntentCode: 'emotional_outcomes.validate_experience',
    padPleasure: 0.15,
    padArousal: 0.10,
    padDominance: -0.12,
    tags: ['empathy', 'mirroring', 'P2']
  },
  {
    utteranceText: "That seems to mean a lot to you.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive',
    outcomeIntentCode: 'emotional_outcomes.validate_experience',
    padPleasure: 0.35,
    padArousal: 0.05,
    padDominance: -0.08,
    tags: ['empathy', 'mirroring', 'P2']
  },
  {
    utteranceText: "Sounds like something shifted for you.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive',
    outcomeIntentCode: 'cognitive_outcomes.reframe_perspective',
    padPleasure: 0.30,
    padArousal: 0.00,
    padDominance: -0.10,
    tags: ['empathy', 'mirroring', 'P2']
  },
  {
    utteranceText: "I hear some relief in that.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive',
    outcomeIntentCode: 'emotional_outcomes.validate_experience',
    padPleasure: 0.40,
    padArousal: -0.15,
    padDominance: -0.05,
    tags: ['empathy', 'mirroring', 'P2']
  },
  {
    utteranceText: "That sounds like it mattered.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive',
    outcomeIntentCode: 'emotional_outcomes.validate_experience',
    padPleasure: 0.32,
    padArousal: -0.05,
    padDominance: -0.10,
    tags: ['empathy', 'mirroring', 'P2']
  }
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('[BatchImport] Starting empathy/mirroring batch import...');
    console.log('[BatchImport] Utterances to insert:', utterances.length);
    await client.query('BEGIN');

    let inserted = 0;

    for (const u of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');
      const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');

      await client.query(
        `INSERT INTO ltlm_training_examples
         (training_example_id, speaker_character_id, utterance_text, dialogue_function_code,
          speech_act_code, narrative_function_code, pad_pleasure, pad_arousal, pad_dominance,
          emotion_register_id, source, is_canonical, difficulty, tags, category_confidence, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, $10, true, 1, $11, 1.0, NULL, $12)`,
        [
          trainingExampleId,
          SPEAKER_CHARACTER_ID,
          u.utteranceText,
          u.dialogueFunctionCode,
          u.speechActCode,
          null,
          u.padPleasure,
          u.padArousal,
          u.padDominance,
          SOURCE,
          u.tags,
          SPEAKER_CHARACTER_ID
        ]
      );

      await client.query(
        `INSERT INTO ltlm_training_outcome_intents
         (ltlm_outcome_intent_id, training_example_id, outcome_intent_code)
         VALUES ($1, $2, $3)`,
        [outcomeIntentId, trainingExampleId, u.outcomeIntentCode]
      );

      inserted++;
    }

    await client.query('COMMIT');
    console.log('[BatchImport] Empathy/mirroring batch committed.');
    console.log('[BatchImport] Total inserted:', inserted);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[BatchImport] Error:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
