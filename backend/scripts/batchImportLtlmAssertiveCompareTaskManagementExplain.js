import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "This way of framing the task is gentler on your system than trying to do everything at once.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.compare',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Breaking the work into smaller pieces is more workable for you than treating it as one heavy block.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.compare',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "A clear next step is usually more grounding than a perfectly detailed long‑term plan.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.compare',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Writing down what you know is often easier than trying to hold every detail in your head.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.compare',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "A small, honest pass is more useful than waiting for the perfect conditions to appear.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.compare',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Checking in with your actual capacity is safer than assuming you can push through indefinitely.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.compare',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Naming one concrete action is more stabilising than spinning through all the possibilities at once.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.compare',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "A plan that respects your limits will last longer than one that relies on a surge of willpower.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.compare',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Choosing one focus is often more effective than trying to keep several half‑open in parallel.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.compare',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Returning to this steadily over time is kinder to you than forcing a single all‑out sprint.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.compare',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM assertive.compare / task_management.explain batch import...');

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

      const tags = ['ltlm', 'task_management.explain', 'assertive.compare'];
      const source = 'ltlm_brief.assertive.compare.task_management.explain';
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
    console.log('LTLM assertive.compare / task_management.explain batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM assertive.compare batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM assertive.compare batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM assertive.compare batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
