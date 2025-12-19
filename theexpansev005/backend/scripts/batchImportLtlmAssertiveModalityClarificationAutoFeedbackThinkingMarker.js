import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "This part doesn’t have to be perfect; it just needs to be clear enough to use.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.modality_clarification',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.05,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You don’t need to lock in the whole plan; deciding the next step is sufficient for now.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.modality_clarification',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.05,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It’s okay if some details stay fuzzy for the moment; they can be clarified later.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.modality_clarification',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.04,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This decision doesn’t have to be final; you can revise it once you see how it feels in practice.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.modality_clarification',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.04,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You’re allowed to pause and come back to this, even if it isn’t fully resolved yet.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.modality_clarification',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Not everything here needs your best thinking; “good enough for now” is acceptable for some pieces.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.modality_clarification',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This is something you can safely postpone until you have more signal, if that feels kinder to your system.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.modality_clarification',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You don’t have to track every thread at once; it’s enough to keep hold of the main one.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.modality_clarification',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.04,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It’s optional to optimise this right now; the priority is getting a workable version in place.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.modality_clarification',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.08,
    pad_arousal: 0.04,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You’re not required to hold the whole system in mind; we can externalise and revisit pieces as needed.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.modality_clarification',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM assertive.modality_clarification / auto_feedback.thinking_marker batch import...');

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

      const tags = ['ltlm', 'auto_feedback.thinking_marker', 'assertive.modality_clarification'];
      const source = 'ltlm_brief.assertive.modality_clarification.auto_feedback.thinking_marker';
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
    console.log('LTLM assertive.modality_clarification / auto_feedback.thinking_marker batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM assertive.modality_clarification batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('LTLM assertive.modality_clarification batch import script finished.');
}).catch((err) => {
  console.error('Unexpected error in LTLM assertive.modality_clarification batch import script:');
  console.error(err);
  process.exitCode = 1;
});
