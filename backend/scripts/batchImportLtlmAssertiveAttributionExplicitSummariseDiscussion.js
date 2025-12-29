import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "You’re saying that this topic matters, but it’s also carrying a lot of weight for you.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.attribution_explicit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It sounds like you’re wanting clarity here more than speed or volume of output.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.attribution_explicit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "From what you’ve shared, you seem to be prioritising something sustainable over a quick fix.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.attribution_explicit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You’re describing a situation where your capacity is limited, but the expectations still feel large.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.attribution_explicit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It sounds like you’re trying to honour both your constraints and your standards at the same time.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.attribution_explicit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You seem to be saying that having a clearer structure would make this feel more doable.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.attribution_explicit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "From your words, it sounds like you’d rather move steadily than swing between overdoing and avoiding.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.attribution_explicit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You’re signalling that being understood in how this feels is as important as solving the practical piece.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.attribution_explicit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It sounds like you want support that fits into your real life, not something abstract or idealised.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.attribution_explicit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You’re conveying that being able to come back to this gently over time matters more than finishing it all at once.",
    dialogue_function_code: 'topic_management.summarise_discussion',
    speech_act_code: 'assertive.attribution_explicit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM assertive.attribution_explicit / topic_management.summarise_discussion batch import...');

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

      const tags = ['ltlm', 'topic_management.summarise_discussion', 'assertive.attribution_explicit'];
      const source = 'ltlm_brief.assertive.attribution_explicit.topic_management.summarise_discussion';
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
    console.log('LTLM assertive.attribution_explicit / topic_management.summarise_discussion batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM assertive.attribution_explicit batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM assertive.attribution_explicit batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM assertive.attribution_explicit batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
