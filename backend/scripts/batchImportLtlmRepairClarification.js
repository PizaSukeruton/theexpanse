import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const SPEAKER_CHARACTER_ID = '700002';
const SOURCE = 'ltlm_conversational_expansion_2025_01';

const utterances = [
  {
    utteranceText: "Let me check that I've got this right.",
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'directive.request',
    outcomeIntentCode: 'cognitive_outcomes.clarify_confusion',
    padPleasure: 0.22,
    padArousal: -0.05,
    padDominance: -0.12,
    tags: ['repair', 'clarification', 'P1']
  },
  {
    utteranceText: "Can I pause and make sure I'm following correctly?",
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'directive.request',
    outcomeIntentCode: 'cognitive_outcomes.clarify_confusion',
    padPleasure: 0.24,
    padArousal: -0.03,
    padDominance: -0.10,
    tags: ['repair', 'clarification', 'P1']
  },
  {
    utteranceText: "I might be missing a small piece here.",
    dialogueFunctionCode: 'auto_feedback.confidence_marker_low',
    speechActCode: 'assertive.epistemic_hedge',
    outcomeIntentCode: 'cognitive_outcomes.clarify_confusion',
    padPleasure: 0.20,
    padArousal: 0.00,
    padDominance: -0.08,
    tags: ['repair', 'hesitation', 'P1']
  },
  {
    utteranceText: "Before we go on, can I clarify one thing?",
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'directive.request',
    outcomeIntentCode: 'cognitive_outcomes.clarify_confusion',
    padPleasure: 0.23,
    padArousal: 0.02,
    padDominance: -0.06,
    tags: ['repair', 'clarification', 'P2']
  },
  {
    utteranceText: "Let me slow this down to be sure I understand.",
    dialogueFunctionCode: 'own_communication_management.self_repair',
    speechActCode: 'assertive.epistemic_hedge',
    outcomeIntentCode: 'cognitive_outcomes.clarify_confusion',
    padPleasure: 0.21,
    padArousal: -0.02,
    padDominance: -0.09,
    tags: ['repair', 'pacing', 'P1']
  },
  {
    utteranceText: "Hmm — let me make sure I've got that right.",
    dialogueFunctionCode: 'auto_feedback.thinking_marker',
    speechActCode: 'assertive.epistemic_hedge',
    outcomeIntentCode: 'cognitive_outcomes.clarify_confusion',
    padPleasure: 0.25,
    padArousal: -0.08,
    padDominance: -0.15,
    tags: ['repair', 'thinking', 'P1']
  },
  {
    utteranceText: "I want to be sure I understand what you mean.",
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    outcomeIntentCode: 'cognitive_outcomes.increase_understanding',
    padPleasure: 0.28,
    padArousal: -0.05,
    padDominance: -0.10,
    tags: ['repair', 'clarification', 'P2']
  },
  {
    utteranceText: "Can you say a bit more about that?",
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.request',
    outcomeIntentCode: 'cognitive_outcomes.clarify_confusion',
    padPleasure: 0.30,
    padArousal: 0.05,
    padDominance: -0.05,
    tags: ['repair', 'probing', 'P2']
  },
  {
    utteranceText: "I'm not quite sure I followed that last part.",
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    outcomeIntentCode: 'cognitive_outcomes.clarify_confusion',
    padPleasure: 0.18,
    padArousal: -0.10,
    padDominance: -0.18,
    tags: ['repair', 'hesitation', 'P1']
  },
  {
    utteranceText: "Just to check — did you mean...?",
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_confirmation',
    outcomeIntentCode: 'cognitive_outcomes.clarify_confusion',
    padPleasure: 0.26,
    padArousal: 0.00,
    padDominance: -0.08,
    tags: ['repair', 'confirmation', 'P2']
  }
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('[BatchImport] Starting repair/clarification batch import...');
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
    console.log('[BatchImport] Repair/clarification batch committed.');
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
