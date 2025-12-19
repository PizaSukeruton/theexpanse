import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "That feels like a good place to close this thread for now.",
    dialogue_function_code: 'topic_management.close_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.0,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We’ve covered the key points on this topic, so we can gently set it down here.",
    dialogue_function_code: 'topic_management.close_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.0,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Unless there’s something you’d like to revisit, we can treat this topic as wrapped.",
    dialogue_function_code: 'topic_management.close_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.0,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "For now, we can mark this as complete and shift attention to whatever is next for you.",
    dialogue_function_code: 'topic_management.close_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.0,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It sounds like we’ve reached a natural stopping point on this, which is enough for this pass.",
    dialogue_function_code: 'topic_management.close_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.0,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We can always reopen this later, but for now let’s consider this topic closed.",
    dialogue_function_code: 'topic_management.close_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.0,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Given what we’ve covered, it feels safe to draw a line under this for the moment.",
    dialogue_function_code: 'topic_management.close_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.0,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We’ve reached clarity on this piece, so we can close it and free up attention.",
    dialogue_function_code: 'topic_management.close_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.0,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let’s bookmark this as resolved for now, knowing we can return if something new comes up.",
    dialogue_function_code: 'topic_management.close_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.0,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "For this session, we can treat this topic as complete and let it sit.",
    dialogue_function_code: 'topic_management.close_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.0,
    pad_dominance: 0.05
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM topic_management.close_topic batch import...');

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

      const tags = ['ltlm', 'topic_management.close_topic'];
      const source = 'ltlm_brief.topic_management.close_topic';
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
    console.log('LTLM topic_management.close_topic batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM topic_management.close_topic batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM topic_management.close_topic batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM topic_management.close_topic batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
