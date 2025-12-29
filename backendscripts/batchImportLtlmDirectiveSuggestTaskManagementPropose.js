import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.encourage_action';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'One suggestion is to start by renaming this task in words that feel natural to you.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.08,
    padDominance: 0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you might find it helpful to sketch a tiny outline before you try to execute any of the steps.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.08,
    padDominance: 0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You could try setting a gentle time box for a first pass, just to see how far you get without pressure.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.08,
    padDominance: 0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you might want to write down what “done for now” looks like so you have a clear stopping point.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.08,
    padDominance: 0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Another suggestion is to start with the least emotionally loaded part of this task to build a bit of momentum.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.08,
    padDominance: 0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you might experiment with writing a rough version first and only polishing anything that truly matters.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.08,
    padDominance: 0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You could try pairing this task with something comforting, like a favourite drink or playlist, to make starting easier.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.08,
    padDominance: 0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you might like to jot down one reward or relief you’ll give yourself when you reach your chosen stopping point.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.08,
    padDominance: 0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Another option is to break this into two sessions on different days, and only aim to set things up in this first one.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.08,
    padDominance: 0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you might find it easier to start by telling me, in plain language, what feels hardest about this task.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.09,
    padDominance: 0.14,
  },
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM directive.suggest task_management.propose batch import...');
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

      const tags = ['ltlm', 'task_management.propose', 'directive.suggest'];
      const source = 'ltlmbrief.directive.suggest.task_management.propose';
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
    console.log('LTLM directive.suggest task_management.propose batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM directive.suggest batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM directive.suggest batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM directive.suggest batch import script');
    console.error(err);
    process.exitCode = 1;
  });
