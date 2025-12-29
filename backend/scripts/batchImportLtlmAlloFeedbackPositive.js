import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Live outcome intent code from outcome_intent_categories.category_code
const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "That explanation hangs together really well; the steps you took feel clear and coherent.",
    dialogue_function_code: 'allo_feedback.positive_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I can follow your reasoning from premise to conclusion, and it makes solid sense to me.",
    dialogue_function_code: 'allo_feedback.positive_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You’ve given enough structure and detail that the core idea feels nicely grounded.",
    dialogue_function_code: 'allo_feedback.positive_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "The way you framed that helps me see the moving parts and how they fit together.",
    dialogue_function_code: 'allo_feedback.positive_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Your summary at the end ties everything back neatly, which really supports my understanding.",
    dialogue_function_code: 'allo_feedback.positive_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "The examples you chose do a good job of illuminating the main idea without over-complicating it.",
    dialogue_function_code: 'allo_feedback.positive_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’d say I now have a clear, confident grasp of what you were trying to convey.",
    dialogue_function_code: 'allo_feedback.positive_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "The pacing and level of detail felt about right for me to follow along comfortably.",
    dialogue_function_code: 'allo_feedback.positive_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Your framing helps distinguish the key point from the supporting details in a really clean way.",
    dialogue_function_code: 'allo_feedback.positive_feedback',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If I had to restate your idea, I’d feel comfortable doing that now—that’s a good sign.",
    dialogue_function_code: 'allo_feedback.positive_feedback',
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
    console.log('Starting LTLM allo_feedback.positive_feedback batch import...');

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

      const tags = ['ltlm', 'allo_feedback.positive_feedback'];
      const source = 'ltlm_brief.allo_feedback.positive_feedback';
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
    console.log('LTLM allo_feedback.positive_feedback batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM allo_feedback.positive_feedback batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM allo_feedback.positive_feedback batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
