import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.reinforce_behavior';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'First, write down the exact task name so we both know what we are working on.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.08,
    padDominance: 0.2,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Next, list the inputs you already have available for this task before you try to act on it.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.08,
    padDominance: 0.21,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Now, choose one clear next action and write it as a short, concrete instruction to yourself.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.09,
    padDominance: 0.22,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Please set a small boundary around this task by deciding when you will stop for today.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.08,
    padDominance: 0.2,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Capture any assumptions you are making about this task in one or two short sentences.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.08,
    padDominance: 0.2,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Write down one simple safeguard you will use to notice if this task is drifting off track.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.08,
    padDominance: 0.21,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Identify and note one person, tool, or resource you can lean on if you get stuck.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.08,
    padDominance: 0.21,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Before you begin, instruct yourself to check in after a short block of work and record how it went.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.09,
    padDominance: 0.22,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Decide where you will store notes and decisions for this task, and write that location down now.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.08,
    padDominance: 0.21,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Finally, give yourself a brief instruction about how you will know when this task is good enough to stop.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.09,
    padDominance: 0.22,
  },
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM directive.instruct task_management.instruct batch import...');
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

      const tags = ['ltlm', 'task_management.instruct', 'directive.instruct'];
      const source = 'ltlmbrief.directive.instruct.task_management.instruct';
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
    console.log('LTLM directive.instruct task_management.instruct batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM directive.instruct batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM directive.instruct batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM directive.instruct batch import script');
    console.error(err);
    process.exitCode = 1;
  });
