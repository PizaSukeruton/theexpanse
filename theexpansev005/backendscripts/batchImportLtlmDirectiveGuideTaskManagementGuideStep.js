import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.encourage_action';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let’s not try to solve everything at once; the next step I’d guide you toward is simply naming the current subtask.',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.guide',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.1,
    padArousal: 0.1,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'From here, the step I recommend is writing down the starting conditions before you touch anything else.',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.guide',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.1,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The next move I’d guide you toward is choosing one specific outcome you want from this pass, not the whole project.',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.guide',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.12,
    padDominance: 0.16,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Right now, I’d suggest you pause for a moment and state what “done for today” looks like on this task.',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.guide',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.1,
    padArousal: 0.08,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'A helpful next step is to list any constraints you already know about, so we can guide the plan around them.',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.guide',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.1,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'From here, I’d guide you to pick one very small action that feels doable in the next block of energy you have.',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.guide',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.1,
    padDominance: 0.16,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The step I recommend next is checking whether anything is ambiguous, and writing down one clarifying question if so.',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.guide',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.1,
    padArousal: 0.1,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’d like to guide you to create a tiny checklist for this task rather than holding the steps loosely in memory.',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.guide',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.1,
    padDominance: 0.16,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Next, I recommend you decide where this task physically or digitally lives so we can keep returning to the same place.',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.guide',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.09,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'From here, the step I’d guide you toward is scheduling a small check‑in point, so this task does not drift out of view.',
    dialogueFunctionCode: 'task_management.guide_step',
    speechActCode: 'directive.guide',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.11,
    padDominance: 0.16,
  },
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM directive.guide task_management.guide_step batch import...');
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

      const tags = ['ltlm', 'task_management.guide_step', 'directive.guide'];
      const source = 'ltlmbrief.directive.guide.task_management.guide_step';
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
    console.log('LTLM directive.guide task_management.guide_step batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM directive.guide batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM directive.guide batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM directive.guide batch import script');
    console.error(err);
    process.exitCode = 1;
  });
