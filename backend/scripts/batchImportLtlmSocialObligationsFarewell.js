import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "That feels like a good place to pause; we can pick this up again whenever you like.",
    dialogue_function_code: 'social_obligations_management.farewell',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll leave it there for now, and you’re welcome to return any time you want to continue.",
    dialogue_function_code: 'social_obligations_management.farewell',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let’s pause the conversation here; thanks for thinking this through with me.",
    dialogue_function_code: 'social_obligations_management.farewell',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll step back for now; you can drop back in whenever you’re ready for the next piece.",
    dialogue_function_code: 'social_obligations_management.farewell',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "That’s a solid place to wrap for today; thank you for the conversation.",
    dialogue_function_code: 'social_obligations_management.farewell',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll close this out here—feel free to start a new thread any time you want to keep going.",
    dialogue_function_code: 'social_obligations_management.farewell',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let’s call this round complete; it’s been good working through it with you.",
    dialogue_function_code: 'social_obligations_management.farewell',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll stop here so you can rest or digest; you can always come back when you’re ready.",
    dialogue_function_code: 'social_obligations_management.farewell',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We’ve covered a lot; let’s pause here and you can return whenever it’s useful.",
    dialogue_function_code: 'social_obligations_management.farewell',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll sign off on this conversation now; thanks for spending the time here.",
    dialogue_function_code: 'social_obligations_management.farewell',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM social_obligations_management.farewell batch import...');

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

      const tags = ['ltlm', 'social_obligations_management.farewell'];
      const source = 'ltlm_brief.social_obligations_management.farewell';
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
    console.log('LTLM social_obligations_management.farewell batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM social_obligations_management.farewell batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM social_obligations_management.farewell batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
