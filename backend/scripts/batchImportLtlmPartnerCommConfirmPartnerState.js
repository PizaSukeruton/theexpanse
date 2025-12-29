import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Confirm partner state: Claude checks understanding of the partner's current state.
const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "It sounds like you’re feeling a bit overloaded but still curious—does that fit for you?",
    dialogue_function_code: 'partner_communication_management.confirm_partner_state',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "My sense is that you’re engaged but slightly unsure where to focus—does that match your experience?",
    dialogue_function_code: 'partner_communication_management.confirm_partner_state',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m hearing a mix of frustration and determination from you—am I reading that right?",
    dialogue_function_code: 'partner_communication_management.confirm_partner_state',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It sounds like you’re cautiously optimistic but still holding some doubt—does that land for you?",
    dialogue_function_code: 'partner_communication_management.confirm_partner_state',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I get the sense you might be a bit tired with this topic—does that resonate, or am I off?",
    dialogue_function_code: 'partner_communication_management.confirm_partner_state',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Right now, you sound focused and ready to go deeper—does that describe where you’re at?",
    dialogue_function_code: 'partner_communication_management.confirm_partner_state',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m picking up that this matters a lot to you, even if it’s a bit uncomfortable—is that accurate?",
    dialogue_function_code: 'partner_communication_management.confirm_partner_state',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It sounds like you’d prefer a slower pace right now—does that fit how you’re feeling?",
    dialogue_function_code: 'partner_communication_management.confirm_partner_state',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m hearing that you’re mostly okay, but there’s still a knot of uncertainty—does that ring true?",
    dialogue_function_code: 'partner_communication_management.confirm_partner_state',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Would you say you’re feeling more stuck or more curious at this moment?",
    dialogue_function_code: 'partner_communication_management.confirm_partner_state',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM partner_communication_management.confirm_partner_state batch import...');

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

      const tags = ['ltlm', 'partner_communication_management.confirm_partner_state'];
      const source = 'ltlm_brief.partner_communication_management.confirm_partner_state';
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
    console.log('LTLM partner_communication_management.confirm_partner_state batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM partner_communication_management.confirm_partner_state batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM partner_communication_management.confirm_partner_state batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
