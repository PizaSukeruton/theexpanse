import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "Let’s slow the pace a little so each step feels manageable rather than rushed.",
    dialogue_function_code: 'time_management.pace_control',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you like, we can pick up the pace for a short burst and then return to a calmer rhythm.",
    dialogue_function_code: 'time_management.pace_control',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Right now, it might help to pause briefly, then continue at a steadier, more sustainable pace.",
    dialogue_function_code: 'time_management.pace_control',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We can keep the current pace if it feels okay, and only slow down when you notice strain.",
    dialogue_function_code: 'time_management.pace_control',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If things feel too fast, we can stretch the steps out and give each one more breathing room.",
    dialogue_function_code: 'time_management.pace_control',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: -0.05,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you’re feeling under‑stimulated, we can compress a few steps and move through them more quickly.",
    dialogue_function_code: 'time_management.pace_control',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let’s aim for a pace where you can still think clearly and notice what’s happening as you work.",
    dialogue_function_code: 'time_management.pace_control',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We can treat this as intervals: a focused stretch of work, then a short reset before the next one.",
    dialogue_function_code: 'time_management.pace_control',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you start to feel overloaded, we’ll deliberately slow down and simplify the next step.",
    dialogue_function_code: 'time_management.pace_control',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: -0.05,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you notice your attention drifting, we can briefly increase intensity, then settle back to a baseline pace.",
    dialogue_function_code: 'time_management.pace_control',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM time_management.pace_control batch import...');

    await client.query('BEGIN');

    for (const utterance of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');

      const narrativeFunctionCode = utterance.narrative_function_code_raw || null;
      const emotionRegisterId = null;

      const insertExampleSql = `
        INSERT INTO ltlm_training_examples (
          training_example_id,
          speaker_character_id,
          utterance_text,
          dialogue_function_code,
          speech_act_code,
          narrative_function_code,
          pad_pleasure,
          pad_arousal,
          pad_dominance,
          emotion_register_id,
          source,
          is_canonical,
          difficulty,
          tags,
          category_confidence,
          notes,
          created_by
        ) VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          $15,
          $16,
          $17
        )
      `;

      const tags = ['ltlm', 'time_management.pace_control'];
      const source = 'ltlm_brief.time_management.pace_control';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = null;
      const createdBy = '700002';

      await client.query(insertExampleSql, [
        trainingExampleId,
        utterance.speaker_character_id,
        utterance.utterance_text,
        utterance.dialogue_function_code,
        utterance.speech_act_code,
        narrativeFunctionCode,
        utterance.pad_pleasure,
        utterance.pad_arousal,
        utterance.pad_dominance,
        emotionRegisterId,
        source,
        isCanonical,
        difficulty,
        tags,
        categoryConfidence,
        notes,
        createdBy
      ]);

      console.log(`Inserted ltlm_training_examples row ${trainingExampleId}`);

      if (utterance.outcome_intent_codes_raw) {
        const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');

        const insertOutcomeSql = `
          INSERT INTO ltlm_training_outcome_intents (
            ltlm_outcome_intent_id,
            training_example_id,
            outcome_intent_code
          ) VALUES (
            $1,
            $2,
            $3
          )
        `;

        await client.query(insertOutcomeSql, [
          outcomeIntentId,
          trainingExampleId,
          utterance.outcome_intent_codes_raw
        ]);

        console.log(
          `Inserted ltlm_training_outcome_intents row ${outcomeIntentId} for training_example_id ${trainingExampleId}`
        );
      } else {
        console.log(
          `No outcome_intent_codes_raw for training_example_id ${trainingExampleId}; skipping outcome intents`
        );
      }
    }

    await client.query('COMMIT');
    console.log('LTLM time_management.pace_control batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM time_management.pace_control batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM time_management.pace_control batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM time_management.pace_control batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
