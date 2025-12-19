import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.increase_autonomy';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am not going to encourage you to overload this task with extra goals on top of what you already named.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.refuse',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.02,
    padArousal: 0.06,
    padDominance: 0.22,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I have to refuse the idea of pushing yourself past your current limits just to make this look impressive.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.refuse',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.03,
    padArousal: 0.06,
    padDominance: 0.23,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am not going to suggest a plan that ignores your existing commitments; that option is off the table here.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.refuse',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.03,
    padArousal: 0.06,
    padDominance: 0.22,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I have to say no to any version of this that depends on you never resting or pausing.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.refuse',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.04,
    padArousal: 0.06,
    padDominance: 0.23,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am not willing to frame this task as an obligation you owe to everyone else and never to yourself.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.refuse',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.03,
    padArousal: 0.05,
    padDominance: 0.22,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I need to refuse any plan that treats your needs as irrelevant to how we structure this work.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.refuse',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.04,
    padArousal: 0.05,
    padDominance: 0.23,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am not going to suggest “just push through it” as the primary strategy for this task.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.refuse',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.03,
    padArousal: 0.06,
    padDominance: 0.22,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I have to refuse framing this as a test of your worth; this is just a task, not a verdict on you.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.refuse',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.04,
    padArousal: 0.06,
    padDominance: 0.23,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I will not propose a plan that depends on you never asking for help; that pattern is not one I can support.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.refuse',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.03,
    padArousal: 0.06,
    padDominance: 0.22,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I need to refuse any approach that erases your agency; we will keep you in charge of the choices here.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.refuse',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.02,
    padArousal: 0.06,
    padDominance: 0.23,
  },
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM directive.refuse task_management.propose batch import...');
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

      const tags = ['ltlm', 'task_management.propose', 'directive.refuse'];
      const source = 'ltlmbrief.directive.refuse.task_management.propose';
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
    console.log('LTLM directive.refuse task_management.propose batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM directive.refuse batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM directive.refuse batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM directive.refuse batch import script');
    console.error(err);
    process.exitCode = 1;
  });
