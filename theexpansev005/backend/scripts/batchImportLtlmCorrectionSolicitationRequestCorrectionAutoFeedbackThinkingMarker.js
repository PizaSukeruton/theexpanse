import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "If any part of this feels off or inaccurate, please tell me and I’ll straighten it out.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'correction_solicitation.request_correction',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If I’ve misunderstood something, you can correct me directly and I’ll update how I’m holding it.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'correction_solicitation.request_correction',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If the wording here doesn’t match how you’d say it, feel free to adjust it and I’ll follow your version.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'correction_solicitation.request_correction',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If I’ve put the emphasis in the wrong place, you can nudge me and I’ll rebalance the focus.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'correction_solicitation.request_correction',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If something important is missing here, you can point it out and I’ll weave it into the picture.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'correction_solicitation.request_correction',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If I’ve captured this in the wrong level of detail, let me know and I’ll zoom in or out with you.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'correction_solicitation.request_correction',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If any assumption I’m making isn’t actually true for you, please correct it and I’ll switch to your version.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'correction_solicitation.request_correction',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If the way I’ve framed this doesn’t feel right, you can reshape it and I’ll adopt that framing.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'correction_solicitation.request_correction',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If I’ve missed the tone you were aiming for, tell me how you’d like it to sound and I’ll adjust.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'correction_solicitation.request_correction',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If anything here lands wrong or feels unhelpful, you can say so plainly and I’ll course-correct with you.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'correction_solicitation.request_correction',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM correction_solicitation.request_correction / auto_feedback.thinking_marker batch import...');

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

      const tags = ['ltlm', 'auto_feedback.thinking_marker', 'correction_solicitation.request_correction'];
      const source = 'ltlm_brief.correction_solicitation.request_correction.auto_feedback.thinking_marker';
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

      if (utterance.outcome_intent_codes_raw) {
        const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');
        const insertOutcomeSql = `
          INSERT INTO ltlm_training_outcome_intents (
            ltlm_outcome_intent_id,
            training_example_id,
            outcome_intent_code
          ) VALUES ($1, $2, $3)
        `;
        await client.query(insertOutcomeSql, [
          outcomeIntentId,
          trainingExampleId,
          utterance.outcome_intent_codes_raw
        ]);
      }
    }

    await client.query('COMMIT');
    console.log('LTLM correction_solicitation.request_correction / auto_feedback.thinking_marker batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM correction_solicitation.request_correction batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('LTLM correction_solicitation.request_correction batch import script finished.');
}).catch((err) => {
  console.error('Unexpected error in LTLM correction_solicitation.request_correction batch import script:');
  console.error(err);
  process.exitCode = 1;
});
