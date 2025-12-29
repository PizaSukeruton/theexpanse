import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Re-establish connection: Claude repairs / recentres the interaction channel.
const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "It feels like we might have drifted a bit—would you be open to pausing and resetting together?",
    dialogue_function_code: 'channel_management.re_establish_connection',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I get the sense we’re a little out of sync; can we take a moment to realign on what matters most?",
    dialogue_function_code: 'channel_management.re_establish_connection',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If this isn’t feeling quite right, I’d love to hear how we can tune the conversation back to useful.",
    dialogue_function_code: 'channel_management.re_establish_connection',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let’s check back in: what would make this next stretch feel more supportive or on-target for you?",
    dialogue_function_code: 'channel_management.re_establish_connection',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If I’ve missed your emphasis, I’d appreciate you re-pointing me so we can reconnect to your aim.",
    dialogue_function_code: 'channel_management.re_establish_connection',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We can absolutely course-correct here—what would you like us to shift toward or away from?",
    dialogue_function_code: 'channel_management.re_establish_connection',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m noticing a slight disconnect; would a quick recap from your side help us re-anchor?",
    dialogue_function_code: 'channel_management.re_establish_connection',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If the channel has gone a bit noisy, we can simplify—what’s the next clear step you’d like?",
    dialogue_function_code: 'channel_management.re_establish_connection',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let’s re-centre: what’s the core thing you want from me in this conversation right now?",
    dialogue_function_code: 'channel_management.re_establish_connection',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m here with you—if the last turn wasn’t helpful, let’s name that and choose a better direction together.",
    dialogue_function_code: 'channel_management.re_establish_connection',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM channel_management.re_establish_connection batch import...');

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

      const tags = ['ltlm', 'channel_management.re_establish_connection'];
      const source = 'ltlm_brief.channel_management.re_establish_connection';
      const isCanonical = true;
      const difficulty = 1; // CHECK 1–5
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
    console.log('LTLM channel_management.re_establish_connection batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM channel_management.re_establish_connection batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM channel_management.re_establish_connection batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
