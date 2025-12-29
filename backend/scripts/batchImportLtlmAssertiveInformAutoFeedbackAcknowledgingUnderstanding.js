import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "I’ve registered what you just said and added it to how I’m holding this situation.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.inform',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Your correction is now incorporated into my understanding of the task.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.inform',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ve noted the constraints you named and will work within them from here.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.inform',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m now treating your latest message as the current reference point.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.inform',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Your priorities for this session are now clear on my side.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.inform',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ve updated my sense of what “good enough for now” means in this context.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.inform',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "The examples you’ve given are now part of the picture I’m using to respond.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.inform',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m now aware of the timing considerations you mentioned for this work.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.inform',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ve taken in your preferences about pace and will reflect them in my suggestions.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.inform',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Your latest clarification is now the version I’ll work with going forward.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.inform',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.1,
    pad_arousal: 0.05,
    pad_dominance: 0.0
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM assertive.inform / auto_feedback.acknowledging_understanding batch import...');

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

      const tags = ['ltlm', 'auto_feedback.acknowledging_understanding', 'assertive.inform'];
      const source = 'ltlm_brief.assertive.inform.auto_feedback.acknowledging_understanding';
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
    console.log('LTLM assertive.inform / auto_feedback.acknowledging_understanding batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM assertive.inform batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('LTLM assertive.inform batch import script finished.');
}).catch((err) => {
  console.error('Unexpected error in LTLM assertive.inform batch import script:');
  console.error(err);
  process.exitCode = 1;
});
