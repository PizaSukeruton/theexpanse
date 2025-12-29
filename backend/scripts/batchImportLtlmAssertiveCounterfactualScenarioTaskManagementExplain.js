import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "If this task had been framed as a single giant project, it would likely have felt much heavier to start.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.counterfactual_scenario',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If we hadn’t broken it into smaller steps, you probably would have been more prone to avoid it altogether.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.counterfactual_scenario',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you tried to handle all the details in your head, it would almost certainly feel more chaotic than it does now.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.counterfactual_scenario',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If we removed the checkpoints we’ve added, it would be harder to tell whether anything was actually moving.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.counterfactual_scenario',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you tried to sprint this in one go, you’d likely be more drained than satisfied at the end.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.counterfactual_scenario',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If we hadn’t named a clear “good enough for now”, this would probably keep expanding in scope.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.counterfactual_scenario',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you postponed all of this until you “felt ready”, it would likely still be hanging over you later.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.counterfactual_scenario',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If we hadn’t checked in on your actual capacity, the plan would probably be less kind to you than it is now.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.counterfactual_scenario',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If we ignored time altogether, this task would tend to compete with everything else in your day.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.counterfactual_scenario',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you tried to meet an imaginary perfect standard, this would likely feel more punishing than supportive.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.counterfactual_scenario',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM assertive.counterfactual_scenario / task_management.explain batch import...');

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

      const tags = ['ltlm', 'task_management.explain', 'assertive.counterfactual_scenario'];
      const source = 'ltlm_brief.assertive.counterfactual_scenario.task_management.explain';
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
    console.log('LTLM assertive.counterfactual_scenario / task_management.explain batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM assertive.counterfactual_scenario batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM assertive.counterfactual_scenario batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM assertive.counterfactual_scenario batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
