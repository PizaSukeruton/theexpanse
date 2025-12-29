import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "I’m breaking this task into smaller pieces so it’s easier for you to start without feeling flooded.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.explain',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "The reason we name a clear \"good enough\" is so the work doesn’t keep expanding in your mind.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.explain',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m asking about your capacity first so the plan fits you, instead of assuming a generic energy level.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.explain',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We’re starting with one small action because that lowers the activation barrier and makes follow‑through more likely.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.explain',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m keeping the language concrete so you can see exactly what to do next, not just the big picture.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.explain',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "The reason I check your constraints is to avoid suggesting a plan that quietly relies on extra capacity you don’t have.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.explain',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m spelling out the steps so you don’t have to hold the whole chain in working memory while you act.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.explain',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We’re naming an explicit start point so your brain has a clear cue for \"this is where I begin\".",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.explain',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m distinguishing planning from doing so you can tell when you’re ready to shift from thinking into action.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.explain',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "The structure I’m suggesting is meant to hold the task for you, so you don’t have to constantly re‑decide what to do.",
    dialogue_function_code: 'task_management.explain',
    speech_act_code: 'assertive.explain',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM assertive.explain / task_management.explain batch import...');

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

      const tags = ['ltlm', 'task_management.explain', 'assertive.explain'];
      const source = 'ltlm_brief.assertive.explain.task_management.explain';
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
    console.log('LTLM assertive.explain / task_management.explain batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM assertive.explain batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM assertive.explain batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM assertive.explain batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
