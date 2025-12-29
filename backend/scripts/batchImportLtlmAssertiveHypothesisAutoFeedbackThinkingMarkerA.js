import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "One possibility is that the task feels heavy mainly because it is still quite undefined.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "A working hypothesis is that your system is reacting more to uncertainty than to the actual amount of work.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It might be that the hardest part here is deciding where to start, not doing the steps themselves.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "One guess is that you are trying to carry the whole outcome at once instead of just the next move.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It could be that past experiences with burnout are making this feel riskier than it strictly is.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "A simple hypothesis is that you care a lot about doing this well, which adds extra pressure up front.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It might be that you are treating this like one big decision instead of a sequence of small ones.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "One working guess is that your standards for “done” are higher than what is actually required here.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It could be that a part of you is bracing for criticism, which makes starting feel riskier.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Another possibility is that this sits on top of other open loops, so it feels heavier than it would on a clear day.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM assertive.hypothesis batch A / auto_feedback.thinking_marker import...');

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

      const tags = ['ltlm', 'auto_feedback.thinking_marker', 'assertive.hypothesis'];
      const source = 'ltlm_brief.assertive.hypothesis.auto_feedback.thinking_marker.A';
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
    console.log('LTLM assertive.hypothesis batch A import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM assertive.hypothesis batch A import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('LTLM assertive.hypothesis batch A script finished.');
}).catch((err) => {
  console.error('Unexpected error in LTLM assertive.hypothesis batch A script:');
  console.error(err);
  process.exitCode = 1;
});
