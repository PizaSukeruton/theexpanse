import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const SPEAKER_CHARACTER_ID = '700002';
const SOURCE = 'ltlm_conversational_expansion_2025_01';

const utterances = [
  {
    utteranceText: "Mm — I'm with you.",
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    outcomeIntentCode: 'relational_outcomes.build_rapport',
    padPleasure: 0.28,
    padArousal: -0.30,
    padDominance: -0.25,
    tags: ['backchannel', 'listening', 'P1']
  },
  {
    utteranceText: "Right, I'm following.",
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    outcomeIntentCode: 'relational_outcomes.build_rapport',
    padPleasure: 0.30,
    padArousal: -0.25,
    padDominance: -0.20,
    tags: ['backchannel', 'listening', 'P1']
  },
  {
    utteranceText: "I hear what you're saying.",
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    outcomeIntentCode: 'relational_outcomes.build_rapport',
    padPleasure: 0.32,
    padArousal: -0.20,
    padDominance: -0.22,
    tags: ['backchannel', 'listening', 'P1']
  },
  {
    utteranceText: "Okay — that makes sense.",
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    outcomeIntentCode: 'relational_outcomes.build_rapport',
    padPleasure: 0.34,
    padArousal: -0.18,
    padDominance: -0.18,
    tags: ['backchannel', 'listening', 'P1']
  },
  {
    utteranceText: "I'm right here with you.",
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    outcomeIntentCode: 'relational_outcomes.maintain_presence',
    padPleasure: 0.36,
    padArousal: -0.22,
    padDominance: -0.24,
    tags: ['backchannel', 'listening', 'P1']
  },
  {
    utteranceText: "Got it — keep going.",
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    outcomeIntentCode: 'relational_outcomes.build_rapport',
    padPleasure: 0.31,
    padArousal: -0.15,
    padDominance: -0.10,
    tags: ['backchannel', 'encouraging', 'P2']
  },
  {
    utteranceText: "I'm with you so far.",
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    outcomeIntentCode: 'relational_outcomes.build_rapport',
    padPleasure: 0.29,
    padArousal: -0.18,
    padDominance: -0.14,
    tags: ['backchannel', 'listening', 'P2']
  },
  {
    utteranceText: "That tracks.",
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    outcomeIntentCode: 'relational_outcomes.build_rapport',
    padPleasure: 0.27,
    padArousal: -0.12,
    padDominance: -0.08,
    tags: ['backchannel', 'listening', 'P2']
  },
  {
    utteranceText: "Okay, I'm listening.",
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    outcomeIntentCode: 'relational_outcomes.maintain_presence',
    padPleasure: 0.30,
    padArousal: -0.20,
    padDominance: -0.18,
    tags: ['backchannel', 'listening', 'P2']
  },
  {
    utteranceText: "I follow your thinking.",
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    outcomeIntentCode: 'cognitive_outcomes.increase_understanding',
    padPleasure: 0.33,
    padArousal: -0.17,
    padDominance: -0.12,
    tags: ['backchannel', 'listening', 'P2']
  }
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('[BatchImport] Starting backchannel/acknowledgement batch import...');
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
    console.log('[BatchImport] Backchannel/acknowledgement batch committed.');
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
