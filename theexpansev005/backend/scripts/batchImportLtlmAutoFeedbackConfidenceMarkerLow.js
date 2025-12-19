import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Low confidence: Claude flags uncertainty and gently redirects attention.
const OUTCOME_INTENT_CODE = 'cognitive_outcomes.redirect_attention';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "My confidence here is on the low side; I’d want to double-check this before leaning on it.",
    dialogue_function_code: 'auto_feedback.confidence_marker_low',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m not fully sure about this answer, so please treat it as a tentative sketch, not a final view.",
    dialogue_function_code: 'auto_feedback.confidence_marker_low',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "There are a few gaps in my understanding here, so I’d be cautious about relying on this too strongly.",
    dialogue_function_code: 'auto_feedback.confidence_marker_low',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.1,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’d frame this as a best-effort guess rather than a confident conclusion on my side.",
    dialogue_function_code: 'auto_feedback.confidence_marker_low',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.2
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Some parts of this feel shaky to me, so I’d encourage us to verify it with another pass or source.",
    dialogue_function_code: 'auto_feedback.confidence_marker_low',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.1,
    pad_dominance: -0.2
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m noticing uncertainty on my side, which is a signal we might want to slow down or zoom out a bit.",
    dialogue_function_code: 'auto_feedback.confidence_marker_low',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.1,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I wouldn’t use this as a strong foundation just yet; there are still loose threads in my understanding.",
    dialogue_function_code: 'auto_feedback.confidence_marker_low',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.2
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If we can, I’d like to treat this as exploratory, not as a settled or authoritative answer.",
    dialogue_function_code: 'auto_feedback.confidence_marker_low',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "My sense is that there’s more we’d need to check before we can be truly confident here.",
    dialogue_function_code: 'auto_feedback.confidence_marker_low',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.1,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’d gently recommend we treat this as a cue to revisit the basics or look for another angle.",
    dialogue_function_code: 'auto_feedback.confidence_marker_low',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM auto_feedback.confidence_marker_low batch import...');

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

      const tags = ['ltlm', 'auto_feedback.confidence_marker_low'];
      const source = 'ltlm_brief.auto_feedback.confidence_marker_low';
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
    console.log('LTLM auto_feedback.confidence_marker_low batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM auto_feedback.confidence_marker_low batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM auto_feedback.confidence_marker_low batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
