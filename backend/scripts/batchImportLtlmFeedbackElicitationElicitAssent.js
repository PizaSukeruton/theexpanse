import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.increase_understanding';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'If we approach it this way, does that feel broadly okay to you?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_assent',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.09,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, does this suggestion line up well enough with what you were hoping for?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_assent',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'As a next step, would you be comfortable trying this version first and then adjusting if needed?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_assent',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.09,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, does this feel like a fair way to proceed given everything you have on your plate?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_assent',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Are you okay with us treating this as an experiment rather than a permanent commitment?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_assent',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.09,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, does the balance between structure and flexibility here feel acceptable to you?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_assent',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Would you be okay starting with this smaller version so it feels manageable, rather than pushing for a perfect plan?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_assent',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.09,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, does it feel right enough to you to take this as our working approach for now?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_assent',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Are you comfortable with us checking back in on this after you have had a chance to try it?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_assent',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.09,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, does this feel like enough support for now, or would you prefer we adjust it before you commit?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_assent',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.04,
    padDominance: 0.05
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM feedback_elicitation.elicit_assent batch import...');

    await client.query('BEGIN');

    for (const u of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');
      const narrativeFunctionCode = u.narrativeFunctionCodeRaw ?? null;
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
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9,
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

      const tags = ['ltlm', 'allo_feedback.check_heard_correctly', 'feedback_elicitation.elicit_assent'];
      const source = 'ltlmbrief.feedback_elicitation.elicit_assent.allo_feedback.check_heard_correctly';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = null;
      const createdBy = '700002';

      await client.query(
        insertExampleSql,
        [
          trainingExampleId,
          u.speakerCharacterId,
          u.utteranceText,
          u.dialogueFunctionCode,
          u.speechActCode,
          narrativeFunctionCode,
          u.padPleasure,
          u.padArousal,
          u.padDominance,
          emotionRegisterId,
          source,
          isCanonical,
          difficulty,
          tags,
          categoryConfidence,
          notes,
          createdBy
        ]
      );

      if (u.outcomeIntentCodeRaw) {
        const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');

        const insertOutcomeSql = `
          INSERT INTO ltlm_training_outcome_intents (
            ltlm_outcome_intent_id,
            training_example_id,
            outcome_intent_code
          )
          VALUES ($1, $2, $3)
        `;

        await client.query(
          insertOutcomeSql,
          [
            outcomeIntentId,
            trainingExampleId,
            u.outcomeIntentCodeRaw
          ]
        );
      }
    }

    await client.query('COMMIT');
    console.log('LTLM feedback_elicitation.elicit_assent batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM feedback_elicitation.elicit_assent batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM feedback_elicitation.elicit_assent batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM feedback_elicitation.elicit_assent batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
