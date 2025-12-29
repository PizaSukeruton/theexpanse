import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Repair missed audio: Claude recovers from not hearing / parsing something.
const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "I think I missed part of what you just said—could you repeat that last bit for me?",
    dialogue_function_code: 'channel_management.repair_missed_audio',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "The signal dropped for a moment on my side; would you mind saying that again?",
    dialogue_function_code: 'channel_management.repair_missed_audio',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I caught the start but not the end of that sentence—could you restate the full thought?",
    dialogue_function_code: 'channel_management.repair_missed_audio',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Something glitched for me there; can you repeat the key point you were just making?",
    dialogue_function_code: 'channel_management.repair_missed_audio',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I didn’t quite hear that clearly—would you slow it down and say it one more time?",
    dialogue_function_code: 'channel_management.repair_missed_audio',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Could you repeat the exact phrase you just used so I don’t mis-hear or misquote you?",
    dialogue_function_code: 'channel_management.repair_missed_audio',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I lost a piece in the middle there; would you mind saying that entire answer again from the top?",
    dialogue_function_code: 'channel_management.repair_missed_audio',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It sounded like the audio clipped—can you repeat that in slightly fewer words so I can catch it?",
    dialogue_function_code: 'channel_management.repair_missed_audio',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Just to be safe, could you say that one more time so I know I heard you correctly?",
    dialogue_function_code: 'channel_management.repair_missed_audio',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you repeat that last bit, I’ll track it carefully and mirror it back to confirm I’ve got it.",
    dialogue_function_code: 'channel_management.repair_missed_audio',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM channel_management.repair_missed_audio batch import...');

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

      const tags = ['ltlm', 'channel_management.repair_missed_audio'];
      const source = 'ltlm_brief.channel_management.repair_missed_audio';
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
    console.log('LTLM channel_management.repair_missed_audio batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM channel_management.repair_missed_audio batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM channel_management.repair_missed_audio batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
