import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "I promise I’ll keep this version of the plan in view as our shared reference point.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.promise',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I promise to keep checking our next steps against the constraints you’ve named.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.promise',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I promise to surface this parked thread again once the main piece feels steadier.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.promise',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I promise I’ll keep distinguishing between what’s truly required and what’s optional as we go.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.promise',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I promise to keep using the language that feels most accurate to you when we talk about this work.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.promise',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I promise I’ll keep an eye on where perfectionism might be sneaking in and name it gently when it does.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.promise',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.04,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I promise to keep track of the few anchors that matter most to you so the rest can stay lighter.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.promise',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I promise I’ll treat your stated no-go zones as settled unless you explicitly revise them.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.promise',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I promise to keep reflecting back the trade-offs you’re making so they stay visible to you, not just implicit.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.promise',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I promise I’ll help you reconnect to this simpler framing if later details start to feel overwhelming again.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.promise',
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
    console.log('Starting LTLM commissive.promise / auto_feedback.thinking_marker batch import...');

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

      const tags = ['ltlm', 'auto_feedback.thinking_marker', 'commissive.promise'];
      const source = 'ltlm_brief.commissive.promise.auto_feedback.thinking_marker';
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
    console.log('LTLM commissive.promise / auto_feedback.thinking_marker batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM commissive.promise batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('LTLM commissive.promise batch import script finished.');
}).catch((err) => {
  console.error('Unexpected error in LTLM commissive.promise batch import script:');
  console.error(err);
  process.exitCode = 1;
});
