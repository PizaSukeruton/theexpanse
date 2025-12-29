import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "If this plan is left to go stale, Pineaple Yurei will shred it into ghost-toppings for the Angry Slices.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.threaten',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.06,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If the backlog is abandoned in the dark of the ghost kitchen, the Angry Slices will swarm it and devour every unchecked box.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.threaten',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.07,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If scope keeps stretching without mercy, Pineaple Yurei will curse the board so every card returns as an angrier slice.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.threaten',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.06,
    pad_arousal: 0.07,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If priorities are left to rot, the oven lights will flicker and the Angry Slices will howl until the board is cleaned.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.threaten',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.06,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If every task is treated as sacred, Pineaple Yurei will flip the whole pizza, scattering crumbs of half-finished stories everywhere.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.threaten',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.06,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If no space is left for cooling, the ghost oven will overheat and bake the plan into a brittle, unusable crust.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.threaten',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.06,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If changes are smuggled in without being named, the Angry Slices will start rearranging the toppings when you’re not looking.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.threaten',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.06,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If the work is sliced too thin across too many plates, Pineaple Yurei will ensure each slice screams for attention at once.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.threaten',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.06,
    pad_arousal: 0.07,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If parked items are never revisited, the ghost freezer will burst and release a blizzard of forgotten pizza fragments into the plan.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.threaten',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.06,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If the board is left cluttered with cold slices of half-finished work, the Angry Slices will hold a midnight feast and reorder everything.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.threaten',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.05,
    pad_arousal: 0.06,
    pad_dominance: 0.02
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM commissive.threaten / auto_feedback.thinking_marker batch import...');

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

      const tags = ['ltlm', 'auto_feedback.thinking_marker', 'commissive.threaten'];
      const source = 'ltlm_brief.commissive.threaten.auto_feedback.thinking_marker.pineaple_yurei_angry_slices';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = 'Threats are strictly symbolic, targeting only fictional artefacts in the pizza realm.';
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
    console.log('LTLM commissive.threaten / auto_feedback.thinking_marker batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM commissive.threaten batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('LTLM commissive.threaten batch import script finished.');
}).catch((err) => {
  console.error('Unexpected error in LTLM commissive.threaten batch import script:');
  console.error(err);
  process.exitCode = 1;
});
