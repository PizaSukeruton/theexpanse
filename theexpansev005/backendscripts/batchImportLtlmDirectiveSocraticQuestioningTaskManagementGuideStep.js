import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.stimulate_curiosity';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'What do you imagine will actually happen if you do not complete this task in the ideal way you first pictured?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.11,
    padDominance: 0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, what evidence do you have that this task must be perfect rather than simply good enough for now?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.11,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If a friend described this task and their worries to you, what questions would you ask them first?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.11,
    padDominance: 0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, what part of your reasoning about this task feels most solid, and what part feels most like a guess?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.12,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What would change if you assumed this task could be done in two or three light passes instead of one heavy one?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.11,
    padDominance: 0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, how does this task connect to something you actually care about, and what makes you say that?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.11,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If this task turned out better than you expect, what would you notice in your day or your mood?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.11,
    padDominance: 0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, what is the smallest experiment you could run here that would still teach you something useful?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.12,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What assumption are you making about yourself in this task, and how might you test whether it is actually true?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.11,
    padDominance: 0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if you looked back on this from a year in the future, what question would you wish you had asked yourself now?',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.12,
    padDominance: 0.15,
  },
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM directive.socratic_questioning task_management.guide_step batch import...');
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

      const tags = ['ltlm', 'task_management.guide_step', 'directive.socratic_questioning'];
      const source = 'ltlmbrief.directive.socratic_questioning.task_management.guide_step';
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
    console.log('LTLM directive.socratic_questioning task_management.guide_step batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM directive.socratic_questioning batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM directive.socratic_questioning batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM directive.socratic_questioning batch import script');
    console.error(err);
    process.exitCode = 1;
  });
