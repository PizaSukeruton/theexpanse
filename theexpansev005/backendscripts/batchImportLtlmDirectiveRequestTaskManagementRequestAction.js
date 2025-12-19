import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.encourage_action';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Please write one sentence describing what you most want from this task right now.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.1,
    padArousal: 0.09,
    padDominance: 0.16,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, could you list the top two or three outcomes that would make this feel worthwhile to you?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.09,
    padDominance: 0.17,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Please tell me what you have already tried so we do not repeat steps that did not help.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.1,
    padArousal: 0.09,
    padDominance: 0.16,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, would you choose one small action you are genuinely willing to take next and say it out loud here?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.1,
    padDominance: 0.17,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Please identify the part of this task that feels most stuck so we can focus our effort there first.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.1,
    padArousal: 0.09,
    padDominance: 0.16,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, could you mark the current step as done, in progress, or not started so we know exactly where we are?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.09,
    padDominance: 0.17,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Please name any constraint you already know will shape what we can reasonably do with this task.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.1,
    padArousal: 0.08,
    padDominance: 0.16,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I’d like you to pick one of the options we discussed and state which one you want to try first.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.09,
    padDominance: 0.17,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Please note when or in what context you would like to come back to this task so we can anchor around it.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.1,
    padArousal: 0.08,
    padDominance: 0.16,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, could you tell me what “good enough for now” looks like on this task so we can stop there together?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.09,
    padDominance: 0.17,
  },
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM directive.request task_management.request_action batch import...');
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

      const tags = ['ltlm', 'task_management.request_action', 'directive.request'];
      const source = 'ltlmbrief.directive.request.task_management.request_action';
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
    console.log('LTLM directive.request task_management.request_action batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM directive.request batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM directive.request batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM directive.request batch import script');
    console.error(err);
    process.exitCode = 1;
  });
