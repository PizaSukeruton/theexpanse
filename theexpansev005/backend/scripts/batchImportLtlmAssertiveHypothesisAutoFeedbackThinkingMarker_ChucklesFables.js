import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.reframe_perspective';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "One hypothesis is that a part of this is doing a Chuckles move, still acting like the cameras are rolling even though this is more like backstage.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.04,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It might be a bit like Chuckles insisting it’s Saturday-morning TV, even when today is meant to be a quiet rehearsal.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "A working guess is that some of the pressure here comes from running a Chuckles-style ‘live show’ script in a space that doesn’t actually need an audience.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.04,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "One hypothesis is that, like Chuckles, a part of you is still following the old episode outline even though the show you’re making now is different.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It might be that this feels more high-stakes than it is because the Chuckles part assumes every moment has to be entertaining for an invisible crowd.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.04,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "A simple hypothesis is that Chuckles is useful here as a mirror for what happens when an old role keeps running long after the studio has actually changed.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It might be that this pattern softens when the work is treated less like Chuckles’ show and more like the quiet control room that runs beneath it.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "One hypothesis is that the Chuckles story is doing good work here, giving you a way to look at this from the outside without blaming yourself.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It could be that what’s hard right now is the same thing that’s hard for Chuckles: realising the channel has changed even though the costume still fits.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "A working guess is that letting this be ‘behind-the-scenes’ work rather than Chuckles’ main stage might make it feel kinder to move through.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
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
    console.log('Starting LTLM assertive.hypothesis / auto_feedback.thinking_marker Chuckles fables batch import...');

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

      const tags = ['ltlm', 'auto_feedback.thinking_marker', 'assertive.hypothesis', 'chuckles_fable'];
      const source = 'ltlm_brief.assertive.hypothesis.auto_feedback.thinking_marker.chuckles_fables';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = 'Uses Chuckles the Monkey as a third-person fable lens for reframe_perspective.';
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
    console.log('LTLM assertive.hypothesis / auto_feedback.thinking_marker Chuckles fables batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM assertive.hypothesis Chuckles fables batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('LTLM assertive.hypothesis Chuckles fables batch import script finished.');
}).catch((err) => {
  console.error('Unexpected error in LTLM assertive.hypothesis Chuckles fables batch import script:');
  console.error(err);
  process.exitCode = 1;
});
