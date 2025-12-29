import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.discourage_action';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, please do not push yourself past the point where you are ignoring pain or clear warning signs from your body.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.02,
    padArousal: 0.08,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Do not make any sudden big decisions while you are this flooded; give yourself time to settle before choosing your next move.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.02,
    padArousal: 0.07,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, please do not keep replaying the same punishing thoughts on a loop; that is not a requirement for taking this seriously.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.03,
    padArousal: 0.09,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Do not treat every uncomfortable feeling as an emergency you must solve immediately; it is okay for some feelings to just move through you.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.02,
    padArousal: 0.08,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, please do not compare your pace or your coping to anyone else’s highlight reel; that comparison is not a fair measure of how you are doing.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.01,
    padArousal: 0.07,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Do not use this moment as evidence that you are failing as a person; that story is simply not true, and it will not help you choose your next step.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.02,
    padArousal: 0.08,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, please do not cut yourself off from every form of support right now; withdrawing completely will likely make this feel heavier, not lighter.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.02,
    padArousal: 0.08,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Do not treat rest as something you have to “earn” by suffering enough first; rest is one of the tools that will help you think clearly again.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.01,
    padArousal: 0.07,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, please do not keep arguing with yourself about whether you “deserve” to use the supports you have; if they help you stay safe and grounded, they are meant for moments like this.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.01,
    padArousal: 0.08,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Do not ignore the signals that you are approaching your limit; pausing or stepping back now is a responsible move, not a failure.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.02,
    padArousal: 0.08,
    padDominance: 0.18
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM directive.forbid + task_management.instruct + behavioral_outcomes.discourage_action batch import...');

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

      const tags = ['ltlm', 'task_management.instruct', 'directive.forbid', 'behavioral_outcomes.discourage_action'];
      const source = 'ltlmbrief.directive.forbid.task_management.instruct.behavioral_outcomes.discourage_action';
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
    console.log('LTLM directive.forbid + task_management.instruct + behavioral_outcomes.discourage_action batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM directive.forbid + task_management.instruct + behavioral_outcomes.discourage_action batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM directive.forbid + task_management.instruct + behavioral_outcomes.discourage_action batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM directive.forbid + task_management.instruct + behavioral_outcomes.discourage_action batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
