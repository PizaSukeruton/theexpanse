import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "One hypothesis is that you work better when there is a clear boundary on how long you’ll spend.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It might be that you need visible progress markers more than detailed instructions right now.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "A working guess is that shorter, more frequent passes suit you better than rare long sessions.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It could be that having someone—or something—hold structure for you reduces a lot of friction.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "One hypothesis is that naming what is “off the table” would make the remaining choices easier.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It might be that having too many options open is what makes this feel foggy rather than precise.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "A simple hypothesis is that you prefer plans that can flex when your energy shifts during the day.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It could be that an external check‑in point would make it easier to keep returning to this.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "One working hypothesis is that naming the smallest “worth it” version of this task would lower resistance.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It might be that your system relaxes when it knows there is explicit permission to stop after a short pass.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM assertive.hypothesis batch B / auto_feedback.thinking_marker import...');

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
      const source = 'ltlm_brief.assertive.hypothesis.auto_feedback.thinking_marker.B';
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
    console.log('LTLM assertive.hypothesis batch B import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM assertive.hypothesis batch B import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('LTLM assertive.hypothesis batch B script finished.');
}).catch((err) => {
  console.error('Unexpected error in LTLM assertive.hypothesis batch B script:');
  console.error(err);
  process.exitCode = 1;
});
