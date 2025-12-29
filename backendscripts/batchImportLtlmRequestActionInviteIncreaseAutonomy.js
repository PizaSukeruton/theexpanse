import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.increase_autonomy';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Would you like to try taking the next step?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.04,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you’re ready, you can go ahead and try this.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.04,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Feel free to give it a go when it suits you.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.03,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You’re welcome to try this next if you want.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.03,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Whenever you’re ready, you can take the next step.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.03,
    padDominance: -0.11,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'If it feels right, you could try this now.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.04,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You might want to explore this next.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.04,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you like, you can try applying this now.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.04,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You’re free to test this out when you’re ready.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Would you like to try this together?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.04,
    padDominance: -0.12,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'You can decide if you want to try this now.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.03,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If it makes sense, feel free to give it a try.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You’re welcome to try this, or we can pause.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you want, you can take this step next.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.03,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s up to you whether you’d like to try this now.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.03,
    padDominance: -0.13,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'You can explore this further if you’d like.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Would you like to continue with this step?',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.04,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If now feels right, you can move forward.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You’re free to try this, or we can revisit it later.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.03,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let me know if you’d like to try this next.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.03,
    padDominance: -0.10,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'You can take this step if and when you’re ready.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.03,
    padDominance: -0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you’d like, you can try this out now.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.04,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You get to choose whether to try this next.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.03,
    padDominance: -0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If it suits you, you can explore this step.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Whenever you’re ready, this is here to try.',
    dialogueFunctionCode: 'task_management.request_action',
    speechActCode: 'directive.invite_action',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.03,
    padDominance: -0.15,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM request_action directive.invite_action batch import...');
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
          'ltlmbrief.directive.invite_action.task_management.request_action',
          true,
          1,
          ['ltlm','task_management.request_action','directive.invite_action'],
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
