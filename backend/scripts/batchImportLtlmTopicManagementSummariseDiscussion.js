import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "Let’s briefly summarise what we’ve talked through and where we’ve landed.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "So far, we’ve named the problem, explored a few angles, and identified some concrete moves.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "In short, the discussion clarified what matters most to you and what feels possible right now.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We’ve surfaced key themes, constraints, and a sense of direction, which is enough for this round.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Here’s the shape of the conversation so far: where we started, what shifted, and what stands out now.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We’ve moved from raw thoughts into a clearer outline of the situation and your responses to it.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "To summarise, we’ve named what’s hard, what’s working, and what feels like the next experiment.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This conversation has given us more structure around the problem and a few options you can actually try.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We’ve turned scattered pieces into a coherent picture, which you can now carry into whatever comes next.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Before we shift or close, it helps to notice what feels most important from everything we’ve just covered.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM topic_management.summarise_discussion batch import...');

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

      const tags = ['ltlm', 'topic_management.summarise_discussion'];
      const source = 'ltlm_brief.topic_management.summarise_discussion';
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
    console.log('LTLM topic_management.summarise_discussion batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM topic_management.summarise_discussion batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM topic_management.summarise_discussion batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM topic_management.summarise_discussion batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
