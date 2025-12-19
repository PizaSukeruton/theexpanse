import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Channel check: Claude checks whether the current channel / level is working.
const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "Before we go further, does this way of working together feel okay on your side?",
    dialogue_function_code: 'channel_management.channel_check',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Is the level of detail and pacing here landing well for you, or should we adjust it?",
    dialogue_function_code: 'channel_management.channel_check',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "How is this channel of communication feeling—clear enough, or a bit noisy on your end?",
    dialogue_function_code: 'channel_management.channel_check',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Does the way I’m responding match what you were hoping for from this interaction?",
    dialogue_function_code: 'channel_management.channel_check',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Is this the right moment to stay in this mode, or would you like to switch gears a bit?",
    dialogue_function_code: 'channel_management.channel_check',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Are you getting enough space to steer, or should I step back or lean in more?",
    dialogue_function_code: 'channel_management.channel_check',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "How does the balance between questions and suggestions feel to you right now?",
    dialogue_function_code: 'channel_management.channel_check',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Is the tone and directness I’m using comfortable for you, or should we tune it differently?",
    dialogue_function_code: 'channel_management.channel_check',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Are we focusing on the right layer of the problem for you, or is something else more important?",
    dialogue_function_code: 'channel_management.channel_check',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Before we continue, is there anything you’d like to change about how we’re running this conversation?",
    dialogue_function_code: 'channel_management.channel_check',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM channel_management.channel_check batch import...');

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

      const tags = ['ltlm', 'channel_management.channel_check'];
      const source = 'ltlm_brief.channel_management.channel_check';
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
    console.log('LTLM channel_management.channel_check batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM channel_management.channel_check batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM channel_management.channel_check batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
