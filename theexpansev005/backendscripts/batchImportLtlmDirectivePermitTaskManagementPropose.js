import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.increase_autonomy';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'It is completely allowed to start with a very small version of this task rather than the full, ideal outcome.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.permit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.07,
    padDominance: 0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you have full permission to define “good enough” more modestly for this pass than you usually would.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.permit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.07,
    padDominance: 0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You are allowed to pause and rename this task in clearer language before doing anything else with it.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.permit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.06,
    padDominance: 0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it is permitted to choose the easiest available next step rather than the most impressive one.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.permit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.07,
    padDominance: 0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You are allowed to schedule this task for a time that actually suits your energy instead of forcing it into a tight slot.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.permit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.07,
    padDominance: 0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you have permission to say no to extra scope right now and keep this task as small as it currently is.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.permit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.06,
    padDominance: 0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It is allowed to leave detailed polishing for a later pass; for this round, a rough workable version is acceptable.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.permit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.06,
    padDominance: 0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you have full permission to ask me to hold structure while you just free‑write ideas for this task.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.permit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.07,
    padDominance: 0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You are allowed to move this task lower on your priority list if it genuinely is not the most important thing today.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.permit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.06,
    padDominance: 0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you have permission to choose a version of this task that honours your current limits instead of ignoring them.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.permit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.07,
    padDominance: 0.13,
  },
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM directive.permit task_management.propose batch import...');
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

      const tags = ['ltlm', 'task_management.propose', 'directive.permit'];
      const source = 'ltlmbrief.directive.permit.task_management.propose';
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
    console.log('LTLM directive.permit task_management.propose batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM directive.permit batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM directive.permit batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM directive.permit batch import script');
    console.error(err);
    process.exitCode = 1;
  });
