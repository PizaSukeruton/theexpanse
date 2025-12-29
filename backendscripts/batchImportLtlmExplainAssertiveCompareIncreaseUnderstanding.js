import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.increase_understanding';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'One way to think about it is to compare it to a simpler case.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This works differently from the earlier example we talked about.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Compared to the previous approach, this one has a different focus.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It helps to contrast this with how it’s usually done.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You can understand this better by comparing the two situations.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.06,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Unlike the first option, this one changes how the pieces interact.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This is similar in structure, but different in outcome.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you compare them side by side, the distinction becomes clearer.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.06,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This behaves more like the earlier case than the later one.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The key difference shows up when you compare their roles.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: -0.05,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'This contrasts with the earlier example in an important way.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Looking at both cases highlights what changes and what stays the same.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This approach shares some traits with the other, but not all of them.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Compared to the alternative, this one simplifies a few steps.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.06,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You can see the difference most clearly when you line them up.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.05,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'This is closer to the first case than the second.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The distinction becomes clearer when you compare outcomes.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: -0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This differs mainly in how the process unfolds.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Compared to the other method, this one emphasises a different step.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Seeing both side by side helps explain the difference.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.06,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'This is best understood by contrasting it with what came before.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The comparison helps highlight why this behaves differently.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: -0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This shares a surface similarity, but the underlying logic differs.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Looking at how each one works makes the contrast clearer.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The easiest way to see the difference is by comparing their steps.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: -0.06,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM explain assertive.compare batch import...');
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
