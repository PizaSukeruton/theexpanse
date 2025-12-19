import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.stimulate_curiosity';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Before we move, what is one question about this task that you are genuinely curious to answer?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.scaffolding_prompt',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.11,
    padDominance: 0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if you zoomed out, what pattern do you notice about how you usually approach tasks like this?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.scaffolding_prompt',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.1,
    padDominance: 0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you describe how you would explain this task to a future you who has already finished it?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.scaffolding_prompt',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.11,
    padDominance: 0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, what would change about this task if you treated it as an experiment rather than a verdict on you?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.scaffolding_prompt',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.11,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you imagine the simplest possible version of this task, what would that look like on the page?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.scaffolding_prompt',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.1,
    padDominance: 0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, what is one assumption you are making here that you might want to test instead of just obeying?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.scaffolding_prompt',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.11,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Can you name one way this task could be made 10 percent easier without losing what matters?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.scaffolding_prompt',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.11,
    padDominance: 0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if you were advising a friend on this task, what first step would you suggest to them?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.scaffolding_prompt',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.11,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What is one thing you would be curious to learn from simply trying a tiny version of this task?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.scaffolding_prompt',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.11,
    padDominance: 0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, can you imagine how this task might feel if it were 20 percent more playful, and describe one change that would create that?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.scaffolding_prompt',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.12,
    padDominance: 0.15,
  },
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM directive.scaffolding_prompt task_management.guide_step batch import...');
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

      const tags = ['ltlm', 'task_management.guide_step', 'directive.scaffolding_prompt'];
      const source = 'ltlmbrief.directive.scaffolding_prompt.task_management.guide_step';
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
    console.log('LTLM directive.scaffolding_prompt task_management.guide_step batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM directive.scaffolding_prompt batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM directive.scaffolding_prompt batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM directive.scaffolding_prompt batch import script');
    console.error(err);
    process.exitCode = 1;
  });
