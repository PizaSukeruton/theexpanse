import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.increase_autonomy';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you feel up for it, would you pick one small action you’re willing to take on this task next?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.08,
    padDominance: 0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, would you like to choose the next concrete step here so that it really fits your energy?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.08,
    padDominance: 0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You’re welcome to write a one‑sentence description of the outcome you want, and we can shape the plan around that.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.07,
    padDominance: 0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, would you be willing to pick one option from what we’ve discussed and say which you want to try first?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.08,
    padDominance: 0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If it feels safe, you can name one tiny action that would make this task feel a bit lighter to approach.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.07,
    padDominance: 0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I’d like to invite you to mark where you are right now as “here” so we can see progress from this point.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.07,
    padDominance: 0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You can choose to say out loud one specific thing you’re committing to do after we finish this part of the conversation.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.08,
    padDominance: 0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if it helps, you’re invited to set a gentle check‑in time for yourself and write it down here.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.07,
    padDominance: 0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You’re welcome to describe one constraint you want me to respect so we can plan actions that honour it.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.07,
    padDominance: 0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, would you like to note what “good enough” looks like for you on this task so we can stop there together?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.08,
    padDominance: 0.13,
  },
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM directive.invite_action task_management.request_action batch import...');
    await client.query('BEGIN');

    for (const u of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');
      const narrativeFunctionCode = u.narrativeFunctionCodeRaw ?? null;
      const emotionRegisterId = null;

      const insertExampleSql = `
        INSERT INTO ltlm_training_examples
          (training_example_id,
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
           created_by)
        VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      `;

      const tags = ['ltlm', 'task_management.request_action', 'directive.invite_action'];
      const source = 'ltlmbrief.directive.invite_action.task_management.request_action';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = null;
      const createdBy = '700002';

      await client.query(insertExampleSql, [
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
        createdBy,
      ]);

      if (u.outcomeIntentCodeRaw) {
        const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');
        const insertOutcomeSql = `
          INSERT INTO ltlm_training_outcome_intents
            (ltlm_outcome_intent_id,
             training_example_id,
             outcome_intent_code)
          VALUES
            ($1,$2,$3)
        `;

        await client.query(insertOutcomeSql, [
          outcomeIntentId,
          trainingExampleId,
          u.outcomeIntentCodeRaw,
        ]);
      }
    }

    await client.query('COMMIT');
    console.log('LTLM directive.invite_action task_management.request_action batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM directive.invite_action batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM directive.invite_action batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM directive.invite_action batch import script');
    console.error(err);
    process.exitCode = 1;
  });
