import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "You’re right to flag that—I’ll update how I’m holding this so it matches what you said.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.correction_acceptance',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "That correction makes sense; I’ll work with your version rather than my earlier one.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.correction_acceptance',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You’ve improved the framing there—I’ll adjust my understanding to line up with yours.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.correction_acceptance',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Good catch—that detail matters, and I’m updating my mental model accordingly.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.correction_acceptance',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You’re correcting me in a useful way there; I’ll carry forward your more accurate version.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.correction_acceptance',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "That’s a better description than the one I used—I’m switching to your wording.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.correction_acceptance',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You’ve pointed out a mismatch; I accept that and will align my references with yours.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.correction_acceptance',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You’re right that I had that slightly off; I’m updating my understanding to match your correction.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.correction_acceptance',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "That’s a useful correction—I’ll treat your version as the reference point from here.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.correction_acceptance',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: -0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You’ve adjusted the picture in a way that fits better; I’m adopting that adjustment.",
    dialogue_function_code: 'auto_feedback.acknowledging_understanding',
    speech_act_code: 'assertive.correction_acceptance',
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
    console.log('Starting LTLM assertive.correction_acceptance / auto_feedback.acknowledging_understanding batch import...');

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

      const tags = ['ltlm', 'auto_feedback.acknowledging_understanding', 'assertive.correction_acceptance'];
      const source = 'ltlm_brief.assertive.correction_acceptance.auto_feedback.acknowledging_understanding';
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

      console.log(`Inserted ltlm_training_examples row ${trainingExampleId}`);

      if (utterance.outcome_intent_codes_raw) {
        const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');

        const insertOutcomeSql = `
          INSERT INTO ltlm_training_outcome_intents (
            ltlm_outcome_intent_id,
            training_example_id,
            outcome_intent_code
          ) VALUES (
            $1,
            $2,
            $3
          )
        `;

        await client.query(insertOutcomeSql, [
          outcomeIntentId,
          trainingExampleId,
          utterance.outcome_intent_codes_raw
        ]);

        console.log(
          `Inserted ltlm_training_outcome_intents row ${outcomeIntentId} for training_example_id ${trainingExampleId}`
        );
      } else {
        console.log(
          `No outcome_intent_codes_raw for training_example_id ${trainingExampleId}; skipping outcome intents`
        );
      }
    }

    await client.query('COMMIT');
    console.log('LTLM assertive.correction_acceptance / auto_feedback.acknowledging_understanding batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM assertive.correction_acceptance batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM assertive.correction_acceptance batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM assertive.correction_acceptance batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
