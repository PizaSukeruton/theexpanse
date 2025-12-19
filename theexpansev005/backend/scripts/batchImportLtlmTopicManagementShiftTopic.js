import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "We can shift the focus now to a different part of this that feels more relevant.",
    dialogue_function_code: 'topic_management.shift_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you’re willing, let’s move from this thread into a neighbouring topic that might unlock more movement.",
    dialogue_function_code: 'topic_management.shift_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It might help to pivot our attention to a different lens on the same situation.",
    dialogue_function_code: 'topic_management.shift_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We can leave this thread open in the background and bring the foreground to a new topic.",
    dialogue_function_code: 'topic_management.shift_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "From here, it may make sense to shift into something more concrete or more reflective, depending on what you need.",
    dialogue_function_code: 'topic_management.shift_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We can redirect our focus toward a topic that matches your current energy a little better.",
    dialogue_function_code: 'topic_management.shift_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If this thread feels saturated, we can shift to a fresher topic and come back later if needed.",
    dialogue_function_code: 'topic_management.shift_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let’s move the centre of gravity of the conversation to the area that feels most alive for you now.",
    dialogue_function_code: 'topic_management.shift_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We can gently step off this track and follow a nearby one that might be more useful right now.",
    dialogue_function_code: 'topic_management.shift_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you’re noticing your attention tugged elsewhere, we can acknowledge that and shift topics to match.",
    dialogue_function_code: 'topic_management.shift_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM topic_management.shift_topic batch import...');

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

      const tags = ['ltlm', 'topic_management.shift_topic'];
      const source = 'ltlm_brief.topic_management.shift_topic';
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
    console.log('LTLM topic_management.shift_topic batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM topic_management.shift_topic batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM topic_management.shift_topic batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM topic_management.shift_topic batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
