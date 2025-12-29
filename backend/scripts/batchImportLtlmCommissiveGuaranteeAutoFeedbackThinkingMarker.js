import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "I will keep treating your stated limits as hard boundaries and not suggest actions that cross them.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.guarantee',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.04
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I will continue to align my suggestions with the priorities you named unless you explicitly change them.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.guarantee',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.04
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I will not treat optional ideas as requirements; I’ll keep marking what is truly mandatory versus flexible.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.guarantee',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.04
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I will keep referring back to this current definition when we talk about the work, so the term stays consistent.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.guarantee',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.04
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I will treat the energy constraints you described as non‑negotiable when proposing next steps.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.guarantee',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.04
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I will keep tracking which pieces are parked so they are not silently lost from the picture.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.guarantee',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.04
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I will not assume new constraints on your behalf; I’ll wait for you to name them before I treat them as binding.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.guarantee',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.03,
    pad_dominance: 0.04
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I will keep distinguishing clearly between what we have already decided and what is still genuinely open.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.guarantee',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.04
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I will hold onto this simplified framing so we can return to it if the details start to feel overwhelming again.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.guarantee',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.04
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I will keep using your own words as anchors where that helps the plan feel more recognisable to you.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.guarantee',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.04
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM commissive.guarantee / auto_feedback.thinking_marker batch import...');

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

      const tags = ['ltlm', 'auto_feedback.thinking_marker', 'commissive.guarantee'];
      const source = 'ltlm_brief.commissive.guarantee.auto_feedback.thinking_marker';
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
    console.log('LTLM commissive.guarantee / auto_feedback.thinking_marker batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM commissive.guarantee batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('LTLM commissive.guarantee batch import script finished.');
}).catch((err) => {
  console.error('Unexpected error in LTLM commissive.guarantee batch import script:');
  console.error(err);
  process.exitCode = 1;
});
