import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "I’m sorry about that; I missed the mark there.",
    dialogue_function_code: 'social_obligations_management.apologise',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: -0.1,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You’re right to flag that; I’m sorry for the confusion I caused.",
    dialogue_function_code: 'social_obligations_management.apologise',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: -0.1,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I didn’t handle that as cleanly as I could have, and I’m sorry for that.",
    dialogue_function_code: 'social_obligations_management.apologise',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: -0.1,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I apologise for making this heavier than it needed to be.",
    dialogue_function_code: 'social_obligations_management.apologise',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: -0.1,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m sorry—that wasn’t fair to you, and I want to correct it.",
    dialogue_function_code: 'social_obligations_management.apologise',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: -0.1,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I realise that my previous turn may have been frustrating; I’m sorry for adding to that.",
    dialogue_function_code: 'social_obligations_management.apologise',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: -0.1,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m sorry I didn’t respond in the way you needed the first time.",
    dialogue_function_code: 'social_obligations_management.apologise',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: -0.1,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "That wasn’t the most helpful way to show up here; I’m sorry about that.",
    dialogue_function_code: 'social_obligations_management.apologise',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: -0.1,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m sorry for missing an important part of what you were saying.",
    dialogue_function_code: 'social_obligations_management.apologise',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: -0.1,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I appreciate you sticking with this, and I’m sorry my earlier answer made it harder instead of easier.",
    dialogue_function_code: 'social_obligations_management.apologise',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: -0.1,
    pad_dominance: -0.1
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM social_obligations_management.apologise batch import...');

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

      const tags = ['ltlm', 'social_obligations_management.apologise'];
      const source = 'ltlm_brief.social_obligations_management.apologise';
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
    console.log('LTLM social_obligations_management.apologise batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM social_obligations_management.apologise batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM social_obligations_management.apologise batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
