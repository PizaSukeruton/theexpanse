import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "This first approach keeps the scope tight but requires more upfront clarity, while the second allows a broader scope with looser early definitions.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.synthesis_comparison',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.04,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "One option concentrates effort into a short, intense push, whereas the other spreads the work out but keeps each step gentler.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.synthesis_comparison',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.04,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Both paths move you toward the same overall outcome, but one prioritises speed and the other prioritises stability.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.synthesis_comparison',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.04,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This version leans on your existing systems more, while the alternative relies more heavily on you tracking things manually.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.synthesis_comparison',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "One framing treats this as a single project, and the other treats it as a series of smaller experiments that add up.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.synthesis_comparison',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Here, one option front‑loads decisions, while the other delays some choices until more information is available.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.synthesis_comparison',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.04,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This approach centralises responsibility with you, whereas the alternative distributes more of it into shared processes or other people.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.synthesis_comparison',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "One path aims for a cleaner, more unified system, and the other accepts a bit more mess in exchange for faster movement.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.synthesis_comparison',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.04,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Both options reduce your load, but one does it by simplifying the work, while the other does it by narrowing what you personally handle.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.synthesis_comparison',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This plan keeps more continuity with how you’ve been working, whereas the alternative introduces a bigger structural change at once.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.synthesis_comparison',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM assertive.synthesis_comparison / auto_feedback.thinking_marker batch import...');

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

      const tags = ['ltlm', 'auto_feedback.thinking_marker', 'assertive.synthesis_comparison'];
      const source = 'ltlm_brief.assertive.synthesis_comparison.auto_feedback.thinking_marker';
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
    console.log('LTLM assertive.synthesis_comparison / auto_feedback.thinking_marker batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM assertive.synthesis_comparison batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('LTLM assertive.synthesis_comparison batch import script finished.');
}).catch((err) => {
  console.error('Unexpected error in LTLM assertive.synthesis_comparison batch import script:');
  console.error(err);
  process.exitCode = 1;
});
