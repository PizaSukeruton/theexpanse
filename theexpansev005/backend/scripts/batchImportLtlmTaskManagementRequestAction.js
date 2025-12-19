import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "Please write a short description of what you want to achieve with this task.",
    dialogue_function_code: 'task_management.request_action',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.15,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Could you list the top three things that feel most important to move forward right now?",
    dialogue_function_code: 'task_management.request_action',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.15,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Please tell me what you’ve already tried so we can avoid repeating the same steps.",
    dialogue_function_code: 'task_management.request_action',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.15,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Can you choose one small action you’re willing to take next and say it out loud here?",
    dialogue_function_code: 'task_management.request_action',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.15,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Please confirm which part of the task feels most stuck so we can target that first.",
    dialogue_function_code: 'task_management.request_action',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.15,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Could you mark the current step as done or not‑done so we know exactly where we are?",
    dialogue_function_code: 'task_management.request_action',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.15,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Please identify any constraint that you already know will limit what we can do here.",
    dialogue_function_code: 'task_management.request_action',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.15,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Can you pick one of the options we’ve discussed and state which one you want to try first?",
    dialogue_function_code: 'task_management.request_action',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.15,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Please note the time or context you want to come back to this task so we can anchor around it.",
    dialogue_function_code: 'task_management.request_action',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.15,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Could you tell me what “good enough” looks like for you on this task right now?",
    dialogue_function_code: 'task_management.request_action',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.15,
    pad_dominance: 0.05
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM task_management.request_action batch import...');

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

      const tags = ['ltlm', 'task_management.request_action'];
      const source = 'ltlm_brief.task_management.request_action';
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
    console.log('LTLM task_management.request_action batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM task_management.request_action batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM task_management.request_action batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
