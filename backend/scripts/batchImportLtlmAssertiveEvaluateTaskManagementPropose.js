import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "This option looks like a kinder fit for your current capacity than the others we’ve named.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.evaluate',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "That plan seems more workable day to day than the more ambitious version we sketched earlier.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.evaluate',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This path feels safer for you because it builds in room for rest rather than assuming endless energy.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.evaluate',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This version of the task looks more realistic given everything else you’re carrying.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.evaluate',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This seems like a good compromise between making progress and not overwhelming yourself.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.evaluate',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This approach looks more aligned with your values than the more rushed alternative.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.evaluate',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This option seems easier to return to after a break, which makes it more robust in practice.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.evaluate',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This plan looks like it will give you clearer feedback about what is and isn’t working.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.evaluate',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This feels like a gentler starting point, which is often more sustainable than a sharp push.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.evaluate',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Overall, this option seems like the best fit with both your constraints and your intentions right now.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.evaluate',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM assertive.evaluate / task_management.propose batch import...');

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

      const tags = ['ltlm', 'task_management.propose', 'assertive.evaluate'];
      const source = 'ltlm_brief.assertive.evaluate.task_management.propose';
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
    console.log('LTLM assertive.evaluate / task_management.propose batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM assertive.evaluate batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM assertive.evaluate batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM assertive.evaluate batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
