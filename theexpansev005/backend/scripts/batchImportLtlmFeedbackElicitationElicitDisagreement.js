import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.present_alternative';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'If this does not quite match how you see it, can you tell me what feels off to you?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_disagreement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.05,
    padDominance: 0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if any part of this summary feels wrong or unfair, it would help if you pointed that out.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_disagreement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.05,
    padDominance: 0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Does any piece of what I just said clash with your view, or is there something important I am missing?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_disagreement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.05,
    padDominance: 0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if you disagree with this framing, can you show me where it diverges from your experience?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_disagreement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.05,
    padDominance: 0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I would actually value it if you pushed back anywhere this does not feel accurate or helpful.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_disagreement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.05,
    padDominance: 0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, is there a part of this that you would phrase differently, or that you simply do not agree with?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_disagreement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.05,
    padDominance: 0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If this does not sit right, can you walk me through what feels more true from your side?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_disagreement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.05,
    padDominance: 0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I am very open to you saying “no, that is not it” and offering your own version.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_disagreement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.05,
    padDominance: 0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Does any part of this feel like it misses an important nuance that changes how you see the situation?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_disagreement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.05,
    padDominance: 0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if you feel like I have misunderstood you, can you correct me so we are not building on a wrong assumption?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'feedback_elicitation.elicit_disagreement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.05,
    padDominance: 0.04
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM feedback_elicitation.elicit_disagreement batch import...');

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

      const tags = ['ltlm', 'allo_feedback.request_clarification', 'feedback_elicitation.elicit_disagreement'];
      const source = 'ltlmbrief.feedback_elicitation.elicit_disagreement.allo_feedback.request_clarification';
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
    console.log('LTLM feedback_elicitation.elicit_disagreement batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM feedback_elicitation.elicit_disagreement batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM feedback_elicitation.elicit_disagreement batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM feedback_elicitation.elicit_disagreement batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
