import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "If you’re open to it, we can bring in a new thread that feels relevant here.",
    dialogue_function_code: 'topic_management.introduce_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.25,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "There’s another angle we could explore next that might support what you’re working on.",
    dialogue_function_code: 'topic_management.introduce_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.25,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "When you’re ready, we can open up a fresh topic that builds on this one.",
    dialogue_function_code: 'topic_management.introduce_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.25,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We could shift focus to a related area next and see what emerges there.",
    dialogue_function_code: 'topic_management.introduce_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.25,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you like, we can start a new thread that looks at the same situation from a different level.",
    dialogue_function_code: 'topic_management.introduce_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.25,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "There’s a nearby topic we can open that might give us more room to move.",
    dialogue_function_code: 'topic_management.introduce_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.25,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We can introduce a new line of exploration here, while still keeping this one in view.",
    dialogue_function_code: 'topic_management.introduce_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.25,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If another topic is tugging at your attention, we can name it and bring it into the conversation.",
    dialogue_function_code: 'topic_management.introduce_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.25,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We could gently open a new topic that focuses more on logistics than on reflection, if that helps.",
    dialogue_function_code: 'topic_management.introduce_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.25,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Whenever you’re ready, we can pivot to a fresh topic that feels most alive for you now.",
    dialogue_function_code: 'topic_management.introduce_topic',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.25,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM topic_management.introduce_topic batch import...');

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

      const tags = ['ltlm', 'topic_management.introduce_topic'];
      const source = 'ltlm_brief.topic_management.introduce_topic';
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
    console.log('LTLM topic_management.introduce_topic batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM topic_management.introduce_topic batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM topic_management.introduce_topic batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM topic_management.introduce_topic batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
