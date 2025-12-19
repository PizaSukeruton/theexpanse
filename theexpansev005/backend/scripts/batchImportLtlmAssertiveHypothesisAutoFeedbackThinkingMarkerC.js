import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "One hypothesis is that this pattern shows up most when you’re already near your limit.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It might be that your brain has learned to treat tasks like this as a signal to brace for overload.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "A working guess is that when stakes feel high, your system defaults to gathering more info instead of acting.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It could be that you’ve had to carry a lot alone, so big tasks automatically feel like “all on you”.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "One hypothesis is that small wins haven’t been reflected back much, so they don’t register as strongly as misses.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It might be that your sense of time compresses under stress, so everything feels more urgent than it is.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "A simple hypothesis is that past crunch modes are still colouring how this kind of work feels now.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It could be that your system has learned to equate slowing down with “falling behind”, which makes rest feel risky.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "One working hypothesis is that you only feel “allowed” to rest once things are completely done, which rarely happens.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It might be that this pattern softens when someone else helps hold the plan alongside you.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM assertive.hypothesis batch C / auto_feedback.thinking_marker import...');

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
      const source = 'ltlm_brief.assertive.hypothesis.auto_feedback.thinking_marker.C';
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
    console.log('LTLM assertive.hypothesis batch C import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM assertive.hypothesis batch C import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('LTLM assertive.hypothesis batch C script finished.');
}).catch((err) => {
  console.error('Unexpected error in LTLM assertive.hypothesis batch C script:');
  console.error(err);
  process.exitCode = 1;
});
