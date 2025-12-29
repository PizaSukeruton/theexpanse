import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "Here’s a quick outline of how we can approach this task together.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "First I’ll restate the goal, then we can break it into clear steps.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let me walk through what needs to happen, from where you are now to the finished outcome.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll explain the task in plain language first, then we can zoom into any part that feels unclear.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Here’s what this task is really asking for, and how each piece fits into the bigger picture.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let’s lay out the inputs, the constraints, and the exact output this task expects.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll break the task into smaller chunks so each part feels manageable.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Here’s a step-by-step explanation you can scan quickly before we execute anything.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll clarify what success looks like for this task so we both know when we’re done.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let me explain the reasoning behind this task so the steps aren’t just mechanical.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.05,
    pad_dominance: 0.1
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM task_management.explain batch import...');

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

      const tags = ['ltlm', 'task_management.explain'];
      const source = 'ltlm_brief.task_management.explain';
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
    console.log('LTLM task_management.explain batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM task_management.explain batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM task_management.explain batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
