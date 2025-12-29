import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.increase_understanding';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'One way to see this is to compare it with how the alternative works.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This approach differs from the other mainly in how it handles the core step.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Compared to the earlier method, this one prioritises a different outcome.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.06,
    padDominance: -0.06,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The key difference here is how each option treats the same constraint.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you line them up side by side, the distinction becomes clearer.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.04,
    padDominance: -0.08,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'This works similarly to the other option, but with a different emphasis.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Unlike the previous approach, this one changes how the final step behaves.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.06,
    padDominance: -0.06,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Both approaches aim for the same goal, but they get there differently.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.04,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The contrast is mostly about process rather than outcome.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.04,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Where one option simplifies things, the other adds flexibility.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.05,
    padDominance: -0.06,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Think of it as the difference between doing this early versus later.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This behaves more like the first example than the second.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'In contrast to the simpler case, this one introduces an extra step.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.06,
    padDominance: -0.06,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Both are valid, but they optimise for different trade-offs.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.04,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The distinction becomes clearer when you compare their assumptions.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: -0.08,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'One emphasises consistency, while the other emphasises adaptability.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.04,
    padDominance: -0.06,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Compared side by side, their strengths show up in different places.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This option trades simplicity for control, unlike the other.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: -0.06,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The main difference lies in how each handles edge cases.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'They solve similar problems, but from different angles.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.04,
    padDominance: -0.06,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'One focuses on speed, while the other focuses on accuracy.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: -0.06,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The difference becomes apparent when you look at how they scale.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.06,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Compared to the baseline, this introduces a meaningful change.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: -0.06,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Both approaches are related, but they prioritise different constraints.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.04,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Seeing them together highlights why each exists.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.04,
    padDominance: -0.06,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.explain assertive.compare batch import...');
    await client.query('BEGIN');

    for (const u of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');

      await client.query(
        `
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
        `,
        [
          trainingExampleId,
          u.speakerCharacterId,
          u.utteranceText,
          u.dialogueFunctionCode,
          u.speechActCode,
          null,
          u.padPleasure,
          u.padArousal,
          u.padDominance,
          null,
          'ltlmbrief.assertive.compare.task_management.explain',
          true,
          1,
          ['ltlm','task_management.explain','assertive.compare'],
          1.0,
          null,
          '700002',
        ]
      );

      const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');
      await client.query(
        `
        INSERT INTO ltlm_training_outcome_intents
        (ltlm_outcome_intent_id, training_example_id, outcome_intent_code)
        VALUES ($1,$2,$3)
        `,
        [outcomeIntentId, trainingExampleId, OUTCOME_INTENT_CODE]
      );
    }

    await client.query('COMMIT');
    console.log('LTLM batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM batch import failed.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => console.log('LTLM batch import script finished.'))
  .catch(err => {
    console.error('Unexpected error in LTLM batch import script');
    console.error(err);
    process.exitCode = 1;
  });
