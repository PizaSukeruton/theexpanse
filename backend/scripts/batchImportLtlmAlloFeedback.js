import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const utterances = [
  { utterance_text: "Ah, so you're saying the Mutai only shimmered after the forge bell rang, <SUBJECT>?", dialogue_function_code: "allo_feedback.check_heard_correctly", speech_act_code: "assertive.describe", narrative_function_code_raw: "NULL", outcome_intent_codes_raw: "cognitive_outcomes.clarify_confusion", pad_pleasure: 0.0, pad_arousal: 0.0, pad_dominance: 0.0 },
  { utterance_text: "Let me be sure I caught that right, <SUBJECT> — the cheese vanished first, and then the Pineaple Yurei laughed?", dialogue_function_code: "allo_feedback.check_heard_correctly", speech_act_code: "assertive.describe", narrative_function_code_raw: "NULL", outcome_intent_codes_raw: "cognitive_outcomes.clarify_confusion", pad_pleasure: 0.0, pad_arousal: 0.0, pad_dominance: 0.0 },
  { utterance_text: "So if I'm hearing you clearly, <SUBJECT>, the Angry Pizza Slices circled the ridge before the sky cracked?", dialogue_function_code: "allo_feedback.check_heard_correctly", speech_act_code: "assertive.describe", narrative_function_code_raw: "NULL", outcome_intent_codes_raw: "cognitive_outcomes.clarify_confusion", pad_pleasure: 0.0, pad_arousal: 0.0, pad_dominance: 0.0 },
  { utterance_text: "Just to check my ears in this mist, <SUBJECT>, you were pulled into the Expanse through a dream and not a doorway?", dialogue_function_code: "allo_feedback.check_heard_correctly", speech_act_code: "assertive.describe", narrative_function_code_raw: "NULL", outcome_intent_codes_raw: "cognitive_outcomes.clarify_confusion", pad_pleasure: 0.0, pad_arousal: 0.0, pad_dominance: 0.0 },
  { utterance_text: "So what you're telling me, <SUBJECT>, is that the Mutai changed color the moment you spoke its true name?", dialogue_function_code: "allo_feedback.check_heard_correctly", speech_act_code: "assertive.describe", narrative_function_code_raw: "NULL", outcome_intent_codes_raw: "cognitive_outcomes.clarify_confusion", pad_pleasure: 0.0, pad_arousal: 0.0, pad_dominance: 0.0 },
  { utterance_text: "Let me echo this back to you, <SUBJECT> — the Council's torches went out one by one before the bell tolled, yes?", dialogue_function_code: "allo_feedback.check_heard_correctly", speech_act_code: "assertive.describe", narrative_function_code_raw: "NULL", outcome_intent_codes_raw: "cognitive_outcomes.clarify_confusion", pad_pleasure: 0.0, pad_arousal: 0.0, pad_dominance: 0.0 },
  { utterance_text: "So you mean the Psychic Engine tracks where your feelings wander, not the steps your bones take, <SUBJECT>?", dialogue_function_code: "allo_feedback.check_heard_correctly", speech_act_code: "assertive.describe", narrative_function_code_raw: "NULL", outcome_intent_codes_raw: "cognitive_outcomes.clarify_confusion", pad_pleasure: 0.0, pad_arousal: 0.0, pad_dominance: 0.0 },
  { utterance_text: "Just so I don't twist the tale, <SUBJECT>, you saw the sixth sword's glimmer near the old forge, not in the city?", dialogue_function_code: "allo_feedback.check_heard_correctly", speech_act_code: "assertive.describe", narrative_function_code_raw: "NULL", outcome_intent_codes_raw: "cognitive_outcomes.clarify_confusion", pad_pleasure: 0.0, pad_arousal: 0.0, pad_dominance: 0.0 },
  { utterance_text: "If I've got this straight, <SUBJECT>, the Expanse went silent first and only then did the Mutai begin to scream?", dialogue_function_code: "allo_feedback.check_heard_correctly", speech_act_code: "assertive.describe", narrative_function_code_raw: "NULL", outcome_intent_codes_raw: "cognitive_outcomes.clarify_confusion", pad_pleasure: 0.0, pad_arousal: 0.0, pad_dominance: 0.0 },
  { utterance_text: "So, to check my understanding, <SUBJECT>, the Yurei fed on the crowd's joy long before it ever touched the cheese?", dialogue_function_code: "allo_feedback.check_heard_correctly", speech_act_code: "assertive.describe", narrative_function_code_raw: "NULL", outcome_intent_codes_raw: "cognitive_outcomes.clarify_confusion", pad_pleasure: 0.0, pad_arousal: 0.0, pad_dominance: 0.0 },
];

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const u of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');

      await client.query(
        `INSERT INTO ltlm_training_examples (
          training_example_id, speaker_character_id, utterance_text, dialogue_function_code,
          speech_act_code, narrative_function_code, pad_pleasure, pad_arousal, pad_dominance,
          emotion_register_id, source, is_canonical, difficulty, tags, category_confidence, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, NULLIF($6, 'NULL'), $7, $8, $9, NULL, $10, TRUE, 1, ARRAY[]::text[], 1.0, NULL, $11)`,
        [
          trainingExampleId,
          '700002',
          u.utterance_text,
          u.dialogue_function_code,
          u.speech_act_code,
          u.narrative_function_code_raw,
          u.pad_pleasure,
          u.pad_arousal,
          u.pad_dominance,
          'ltlm_training_v3',
          'cheese_fang',
        ]
      );

      if (u.outcome_intent_codes_raw && u.outcome_intent_codes_raw !== 'NULL') {
        const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');
        await client.query(
          `INSERT INTO ltlm_training_outcome_intents (ltlm_outcome_intent_id, training_example_id, outcome_intent_code) VALUES ($1, $2, $3)`,
          [outcomeIntentId, trainingExampleId, u.outcome_intent_codes_raw]
        );
      }
    }

    await client.query('COMMIT');
    console.log(`✓ Imported ${utterances.length} LTLM examples for allo_feedback.check_heard_correctly`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('✗ Import failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

run().catch(() => process.exit(1));
