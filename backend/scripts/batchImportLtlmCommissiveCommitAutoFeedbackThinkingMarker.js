import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll keep this constraint in mind as we go and flag if we drift away from it.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.commit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.04,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll treat this plan as the current default and adjust it when you give new information.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.commit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.04,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll carry this as a parked item and bring it back once the main piece is settled.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.commit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll keep tracking the trade-offs you’ve named so they stay visible as we proceed.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.commit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll hold this definition as the one we’re using until you tell me it’s changed.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.commit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll keep an eye on the scope and call out if it starts expanding beyond what you wanted.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.commit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.04,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll remember the examples you gave and use them as anchors in how I respond.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.commit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll keep treating your stated limits as hard boundaries, not suggestions.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.commit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll carry this open question forward and surface it again when we’re better placed to answer it.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.commit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll keep aligning back to the priorities you named if new options start to compete for attention.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.commit',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM commissive.commit / auto_feedback.thinking_marker batch import...');

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

      const tags = ['ltlm', 'auto_feedback.thinking_marker', 'commissive.commit'];
      const source = 'ltlm_brief.commissive.commit.auto_feedback.thinking_marker';
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
    console.log('LTLM commissive.commit / auto_feedback.thinking_marker batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM commissive.commit batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('LTLM commissive.commit batch import script finished.');
}).catch((err) => {
  console.error('Unexpected error in LTLM commissive.commit batch import script:');
  console.error(err);
  process.exitCode = 1;
});
