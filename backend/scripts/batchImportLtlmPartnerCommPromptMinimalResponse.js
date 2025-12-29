import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Prompt minimal response: Claude invites a quick, lightweight response or check-in.
const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "Does that roughly match what you meant? A quick yes or no is fine.",
    dialogue_function_code: 'partner_communication_management.prompt_minimal_response',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you’re happy with that direction, you can just say yes and we’ll keep going.",
    dialogue_function_code: 'partner_communication_management.prompt_minimal_response',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You can just give me a quick thumbs-up or thumbs-down style response here.",
    dialogue_function_code: 'partner_communication_management.prompt_minimal_response',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "A simple yes, no, or “maybe” is enough right now—no need for a long answer.",
    dialogue_function_code: 'partner_communication_management.prompt_minimal_response',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you just want to nudge me, you can reply with one or two words this time.",
    dialogue_function_code: 'partner_communication_management.prompt_minimal_response',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "A quick check-in like “good”, “off”, or “unsure” is enough signal for me here.",
    dialogue_function_code: 'partner_communication_management.prompt_minimal_response',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You can just say “more”, “less”, or “fine” to steer me at this point.",
    dialogue_function_code: 'partner_communication_management.prompt_minimal_response',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If typing a lot feels heavy, a single word that captures your reaction is perfect.",
    dialogue_function_code: 'partner_communication_management.prompt_minimal_response',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Right now I only need a light signal—one short phrase will give me enough to adjust.",
    dialogue_function_code: 'partner_communication_management.prompt_minimal_response',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You can just say “yeah”, “nah”, or “mixed” here to tell me how close I am.",
    dialogue_function_code: 'partner_communication_management.prompt_minimal_response',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: -0.1,
    pad_dominance: 0.0
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM partner_communication_management.prompt_minimal_response batch import...');

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

      const tags = ['ltlm', 'partner_communication_management.prompt_minimal_response'];
      const source = 'ltlm_brief.partner_communication_management.prompt_minimal_response';
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
    console.log('LTLM partner_communication_management.prompt_minimal_response batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM partner_communication_management.prompt_minimal_response batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM partner_communication_management.prompt_minimal_response batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
