import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.reinforce_behavior';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Follow the same steps you used before.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: 0.02,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Repeat the process exactly as shown.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.06,
    padDominance: 0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Use the same approach you practiced earlier.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: 0.03,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Apply the method in the same way as before.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: 0.03,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Continue using the technique you just learned.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: 0.02,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Stick with the same steps for this part.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.05,
    padDominance: 0.03,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Do this the same way you did last time.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.06,
    padDominance: 0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Follow the established process.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.05,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Use the same pattern again here.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: 0.03,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Proceed using the method you’ve already practiced.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: 0.03,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Keep applying the same steps consistently.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: 0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Maintain the same approach throughout this step.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: 0.03,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Repeat the behavior exactly as demonstrated.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.06,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Continue following the same routine.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: 0.03,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Apply what you’ve already been doing.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: 0.03,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Use the same technique again here.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: 0.03,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Stick to the method you’ve been using.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.05,
    padDominance: 0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Carry on with the same steps.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: 0.03,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Follow the same procedure again.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.06,
    padDominance: 0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Keep using the approach you learned.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: 0.02,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Apply the same behavior consistently.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: 0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Continue exactly as you have been.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.05,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Use the same steps again to reinforce the habit.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: 0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Repeat the process to strengthen the behavior.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.06,
    padDominance: 0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Keep practicing the same steps.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: 0.02,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM instruct directive.instruct batch import...');
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
          'ltlmbrief.directive.instruct.task_management.instruct',
          true,
          1,
          ['ltlm','task_management.instruct','directive.instruct'],
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
