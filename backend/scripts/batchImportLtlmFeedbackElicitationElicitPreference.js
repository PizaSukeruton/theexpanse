import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.increase_understanding';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Between these options, which one feels most workable for you right now?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_preference',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.09,
    padArousal: 0.05,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if you had to lean slightly one way, which approach would you rather start with?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_preference',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.05,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Does it feel better to you to begin with a smaller step, or would you rather make a bolder change?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_preference',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.09,
    padArousal: 0.05,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, when you imagine trying these, which one feels most like it matches your style?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_preference',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.05,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Would you rather prioritise keeping your workload lighter, or moving faster toward the goal?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_preference',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.09,
    padArousal: 0.05,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, does it suit you more to schedule this in fixed blocks, or to weave it into your days more flexibly?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_preference',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.05,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Out of the options we have named, which one feels least draining to your energy?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_preference',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.09,
    padArousal: 0.05,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, is there a version of this plan that you would actually feel curious to try, rather than just tolerate?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_preference',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.05,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Would you rather have more detailed guidance from me, or more space to improvise as you go?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_preference',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.09,
    padArousal: 0.05,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if you picture yourself a week from now, which choice would you most like to see that version of you having made?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_preference',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.05,
    padDominance: 0.05
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM feedback_elicitation.elicit_preference batch import...');

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

      const tags = ['ltlm', 'allo_feedback.request_clarification', 'feedback_elicitation.elicit_preference'];
      const source = 'ltlmbrief.feedback_elicitation.elicit_preference.allo_feedback.request_clarification';
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
    console.log('LTLM feedback_elicitation.elicit_preference batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM feedback_elicitation.elicit_preference batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM feedback_elicitation.elicit_preference batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM feedback_elicitation.elicit_preference batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
