import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "Start by capturing the current problem in one or two clear sentences.",
    dialogue_function_code: 'task_management.instruct',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.2,
    pad_dominance: 0.25
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Next, list the concrete steps you’ve already taken so we don’t duplicate effort.",
    dialogue_function_code: 'task_management.instruct',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.2,
    pad_dominance: 0.25
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Identify one small action you can complete in the next block of focus, and commit to just that.",
    dialogue_function_code: 'task_management.instruct',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.2,
    pad_dominance: 0.25
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Write down any constraints or blockers you already know about before you start acting.",
    dialogue_function_code: 'task_management.instruct',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.2,
    pad_dominance: 0.25
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Prioritise the steps in rough order of impact, then select the top one to do first.",
    dialogue_function_code: 'task_management.instruct',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.2,
    pad_dominance: 0.25
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Document what “done” looks like for this task in a single sentence before you execute.",
    dialogue_function_code: 'task_management.instruct',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.2,
    pad_dominance: 0.25
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Close any tools or tabs that are not needed for the current step to reduce noise.",
    dialogue_function_code: 'task_management.instruct',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.2,
    pad_dominance: 0.25
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Once you’ve completed this step, record a brief note about what changed before moving on.",
    dialogue_function_code: 'task_management.instruct',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.2,
    pad_dominance: 0.25
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you hit friction, pause and describe the exact point where progress stalled.",
    dialogue_function_code: 'task_management.instruct',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.2,
    pad_dominance: 0.25
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Before you stop for the day, note the very next action you’ll take when you return to this task.",
    dialogue_function_code: 'task_management.instruct',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.2,
    pad_dominance: 0.25
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM task_management.instruct batch import...');

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

      const tags = ['ltlm', 'task_management.instruct'];
      const source = 'ltlm_brief.task_management.instruct';
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
    console.log('LTLM task_management.instruct batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM task_management.instruct batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM task_management.instruct batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
