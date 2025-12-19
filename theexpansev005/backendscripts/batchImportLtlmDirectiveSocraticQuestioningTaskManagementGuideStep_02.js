import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.stimulate_curiosity';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'If this task were surprisingly easy, what would be different about how you are thinking about it right now?',
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
    utteranceText: '<SUBJECT>, what would you notice if you assumed you were allowed to learn as you go instead of knowing everything first?',
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
    utteranceText: 'What is the actual risk of trying a tiny version of this and adjusting, compared with the risk of not starting at all?',
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
    utteranceText: '<SUBJECT>, if you split this task into “thinking” and “doing”, which part actually needs attention first, and why?',
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
    utteranceText: 'What would this task look like if you designed it to be kind to your future self instead of testing your limits?',
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
    utteranceText: '<SUBJECT>, which part of this feels like an inherited rule from someone else, and do you actually agree with it?',
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
    utteranceText: 'If this task were already finished, what would you tell yourself was the single most important step you took?',
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
    utteranceText: '<SUBJECT>, what might you discover if you tried approaching this as play for five minutes instead of as a test?',
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
    utteranceText: 'What story are you telling yourself about what this task means, and what happens if you question that story?',
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
    utteranceText: '<SUBJECT>, if you could ask me one clarifying question about this task, what would it be, and what makes that question important?',
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
    console.log('Starting LTLM directive.socratic_questioning task_management.guide_step batch import (set 2)...');
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
      const source = 'ltlmbrief.directive.socratic_questioning.task_management.guide_step.set2';
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
    console.log('LTLM directive.socratic_questioning task_management.guide_step batch import (set 2) committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM directive.socratic_questioning batch import (set 2) failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM directive.socratic_questioning batch import (set 2) script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM directive.socratic_questioning batch import (set 2) script');
    console.error(err);
    process.exitCode = 1;
  });
