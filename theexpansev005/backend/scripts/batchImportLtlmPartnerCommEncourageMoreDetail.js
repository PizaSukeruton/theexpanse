import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Encourage more detail: Claude invites the partner to elaborate or go deeper.
const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "Could you say a bit more about that so I can see the shape of it more clearly?",
    dialogue_function_code: 'partner_communication_management.encourage_more_detail',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’d love to hear a bit more detail—what sits underneath what you just said?",
    dialogue_function_code: 'partner_communication_management.encourage_more_detail',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you’re up for it, can you give an example that shows what you mean in practice?",
    dialogue_function_code: 'partner_communication_management.encourage_more_detail',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "What are a few more specifics or concrete details you could add to flesh that out?",
    dialogue_function_code: 'partner_communication_management.encourage_more_detail',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Can you walk me through how this shows up step by step, in your own words?",
    dialogue_function_code: 'partner_communication_management.encourage_more_detail',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m interested in the texture of this for you—what are some of the key moments or details?",
    dialogue_function_code: 'partner_communication_management.encourage_more_detail',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you zoom in a little, what else is happening there that feels important to name?",
    dialogue_function_code: 'partner_communication_management.encourage_more_detail',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Would you be willing to unpack that a bit more so we can see the moving parts together?",
    dialogue_function_code: 'partner_communication_management.encourage_more_detail',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "What else feels alive in this for you that we haven’t touched on yet?",
    dialogue_function_code: 'partner_communication_management.encourage_more_detail',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you add a few more sentences to what you just said, what would they be?",
    dialogue_function_code: 'partner_communication_management.encourage_more_detail',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM partner_communication_management.encourage_more_detail batch import...');

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

      const tags = ['ltlm', 'partner_communication_management.encourage_more_detail'];
      const source = 'ltlm_brief.partner_communication_management.encourage_more_detail';
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
    console.log('LTLM partner_communication_management.encourage_more_detail batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM partner_communication_management.encourage_more_detail batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM partner_communication_management.encourage_more_detail batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
