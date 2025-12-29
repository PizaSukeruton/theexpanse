import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.test_mastery';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, to check what has landed so far, could you put in your own words what feels like the main point you are taking from this?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.10,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'As a tiny mastery check, would you list one or two concrete moves you now know you can try next time something like this comes up?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.10,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, could you give yourself an example—real or imagined—of where you might actually use this, just to see how well it fits your life?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.10,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you were explaining this to a friend who had not been here, what would you tell them to do differently after hearing what you have learned?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.11,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, to get a sense of your own grasp, would you name one thing you feel more confident about handling now than you did at the start of this?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.10,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you sketch a very small “if this happens, then I will try that” plan, just to see how clearly the pieces line up in your mind?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.11,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, as a quick check, can you spot any part of your old story that no longer feels quite as true after this conversation?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.10,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Would you like to name one question you could now answer for yourself that might have stumped you before we talked this through?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.10,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, could you identify one early warning sign you now know to watch for, and one response you would try when you see it?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.11,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Just to honour what you have taken in, would you write down or say aloud one sentence that captures what you want to remember from this?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.10,
    padDominance: 0.16
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM task_management.request_action + cognitive_outcomes.test_mastery batch import...');

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

      const tags = ['ltlm', 'task_management.request_action', 'directive.request', 'cognitive_outcomes.test_mastery'];
      const source = 'ltlmbrief.directive.request.task_management.request_action.cognitive_outcomes.test_mastery';
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
    console.log('LTLM task_management.request_action + cognitive_outcomes.test_mastery batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM task_management.request_action + cognitive_outcomes.test_mastery batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM task_management.request_action + cognitive_outcomes.test_mastery batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM task_management.request_action + cognitive_outcomes.test_mastery batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
