import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Live outcome intent code from outcome_intent_categories.category_code
const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "I’ve heard what you’re saying, and I’m still working out exactly how it fits together in my mind.",
    dialogue_function_code: 'allo_feedback.neutral_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I can repeat back the steps you took, though I’m not fully settled on the conclusion yet.",
    dialogue_function_code: 'allo_feedback.neutral_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Your explanation tracks in places, and there are still a few pieces that feel open for refinement.",
    dialogue_function_code: 'allo_feedback.neutral_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m not pushing back on your point, but I’d like a bit more structure so I can see the full arc.",
    dialogue_function_code: 'allo_feedback.neutral_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "At this stage, I’d say I have a working sketch of your idea rather than a crisp picture.",
    dialogue_function_code: 'allo_feedback.neutral_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I can see the direction you’re going in, and I’m still filling in some of the middle steps.",
    dialogue_function_code: 'allo_feedback.neutral_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I don’t disagree with you; I’m just not entirely confident I’ve caught every nuance yet.",
    dialogue_function_code: 'allo_feedback.neutral_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Parts of that make sense to me, and I’m open to another pass to firm up the details.",
    dialogue_function_code: 'allo_feedback.neutral_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’d describe my current understanding as in-progress—neither fully convinced nor confused.",
    dialogue_function_code: 'allo_feedback.neutral_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let’s say I’m tentatively on board, with a few open questions still hovering in the background.",
    dialogue_function_code: 'allo_feedback.neutral_feedback',
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
    console.log('Starting LTLM allo_feedback.neutral_feedback batch import...');

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

      const tags = ['ltlm', 'allo_feedback.neutral_feedback'];
      const source = 'ltlm_brief.allo_feedback.neutral_feedback';
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
    console.log('LTLM allo_feedback.neutral_feedback batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM allo_feedback.neutral_feedback batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM allo_feedback.neutral_feedback batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
