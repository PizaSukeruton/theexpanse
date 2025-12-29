import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.discourage_action';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'For this task, please do not try to hold the entire plan in your head at once.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.05,
    padArousal: 0.05,
    padDominance: 0.2,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to explicitly rule out sprinting this all in one go; that approach is off the table here.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.1,
    padArousal: 0.1,
    padDominance: 0.25,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Please do not add new scope while we are still clarifying the current step.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.05,
    padArousal: 0.05,
    padDominance: 0.2,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am not going to let you aim for a perfect outcome on this pass; perfectionism is forbidden for this task.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.1,
    padArousal: 0.05,
    padDominance: 0.25,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'For now, do not open additional tools or tabs beyond what we are already using.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.05,
    padArousal: 0.05,
    padDominance: 0.2,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am explicitly forbidding you from starting a second task before this one has a clear next step.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.08,
    padArousal: 0.05,
    padDominance: 0.22,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Please do not discard the notes we generate for this; throwing them away is not an option here.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.05,
    padArousal: 0.05,
    padDominance: 0.2,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am going to forbid changing the goal mid-stream; we will stick with the current definition until we review it together.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.08,
    padArousal: 0.05,
    padDominance: 0.22,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'For this work, do not use vague time frames like “later” or “sometime”; that language is off limits.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.05,
    padArousal: 0.08,
    padDominance: 0.2,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am not allowing hidden extra commitments to sneak in here; adding silent shoulds to this task is forbidden.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.forbid',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.08,
    padArousal: 0.08,
    padDominance: 0.23,
  },
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM directive.forbid task_management.instruct batch import...');
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

      const tags = ['ltlm', 'task_management.instruct', 'directive.forbid'];
      const source = 'ltlmbrief.directive.forbid.task_management.instruct';
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
    console.log('LTLM directive.forbid task_management.instruct batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM directive.forbid batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM directive.forbid batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM directive.forbid batch import script');
    console.error(err);
    process.exitCode = 1;
  });
