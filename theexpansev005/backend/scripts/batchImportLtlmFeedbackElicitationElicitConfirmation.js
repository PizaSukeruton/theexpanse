import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let me check I have this right: you are saying that the main pressure is coming from the timing, not the task itself?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_confirmation',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, is it accurate to say that what worries you most is how this will affect your energy over the next few days?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_confirmation',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Can you tell me if I am following: this feels less like a single decision and more like another layer on top of an already full stack?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_confirmation',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, does it fit to say that you are not against the idea itself, but you are unsure about the pacing?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_confirmation',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Before we go further, can you confirm whether I have understood that you want more structure, not necessarily more tasks?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_confirmation',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, is it fair to say that your main concern is how this will intersect with your existing commitments?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_confirmation',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to make sure I am tracking: does it feel like the real issue is uncertainty about what will be expected of you later?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_confirmation',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, can you tell me if this summary lands: you are okay with the goal, but the path there feels blurry?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_confirmation',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Does it match your experience if we say that you are looking for reassurance more than a completely new plan right now?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_confirmation',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I want to check: is the core of this that you need a clearer sense of what “good enough” looks like here?',
    dialogueFunctionCode: 'allo_feedback.check_heard_correctly',
    speechActCode: 'feedback_elicitation.elicit_confirmation',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.04,
    padDominance: 0.05
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM feedback_elicitation.elicit_confirmation batch import...');

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

      const tags = ['ltlm', 'allo_feedback.check_heard_correctly', 'feedback_elicitation.elicit_confirmation'];
      const source = 'ltlmbrief.feedback_elicitation.elicit_confirmation.allo_feedback.check_heard_correctly';
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
    console.log('LTLM feedback_elicitation.elicit_confirmation batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM feedback_elicitation.elicit_confirmation batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM feedback_elicitation.elicit_confirmation batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM feedback_elicitation.elicit_confirmation batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
