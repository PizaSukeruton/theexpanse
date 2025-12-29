import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Thinking marker: Claude signals active processing and invites exploration.
const OUTCOME_INTENT_CODE = 'cognitive_outcomes.stimulate_curiosity';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "I’m still turning this over in my mind and noticing some interesting directions we could explore.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This is giving me a lot to think about; a few new questions are starting to branch out from it.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I can feel my gears whirring on this; part of me wants to follow some side paths it suggests.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This idea is still unfolding for me, and I’m curious where it might connect in your bigger picture.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m holding this as a live question rather than a fixed answer, and that feels energising.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "As I sit with this, a few possible interpretations are bubbling up that could be fun to test.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I notice myself wanting to play with this idea a bit more before settling on a single framing.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This is sparking a few adjacent questions for me that might be worth surfacing together.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m in exploration mode here, noticing patterns but not quite ready to lock anything down yet.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This feels like a good place to stay curious rather than rushing to a closed answer.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM auto_feedback.thinking_marker batch import...');

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

      const tags = ['ltlm', 'auto_feedback.thinking_marker'];
      const source = 'ltlm_brief.auto_feedback.thinking_marker';
      const isCanonical = true;
      const difficulty = 1; // CHECK 1–5
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
    console.log('LTLM auto_feedback.thinking_marker batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM auto_feedback.thinking_marker batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM auto_feedback.thinking_marker batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
