import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.encourage_action';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let’s try taking the next step together.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.05,
    padDominance: -0.02,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I suggest we move forward with this next.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.05,
    padDominance: -0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let’s go ahead and try this step now.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.06,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I propose we start with this part.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: -0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let’s take this step and see how it goes.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.06,
    padDominance: -0.02,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I suggest we give this a try next.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.05,
    padDominance: -0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let’s move ahead with this approach.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.05,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I recommend we start here.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let’s commit to trying this next.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.06,
    padDominance: -0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I think we should go ahead with this step.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: 0.01,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Let’s take action on this now.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.06,
    padDominance: 0.02,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I propose we begin with this step.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: -0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let’s move forward by doing this next.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.06,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I suggest we commit to this approach.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.05,
    padDominance: 0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let’s go ahead and start here.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.05,
    padDominance: 0.00,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I think the best move is to try this now.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.06,
    padDominance: 0.02,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let’s take this step and build from there.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.05,
    padDominance: -0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I propose we act on this first.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: 0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let’s commit to moving forward with this.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.06,
    padDominance: -0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I suggest we start acting on this now.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.06,
    padDominance: 0.01,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Let’s take the initiative and try this.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.06,
    padDominance: 0.02,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I think we’re ready to take this step.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.05,
    padDominance: 0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let’s move into action with this.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.06,
    padDominance: 0.02,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I propose we take this forward now.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.05,
    padDominance: 0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let’s go ahead and put this into action.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.06,
    padDominance: 0.02,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM propose directive.commit batch import...');
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
          'ltlmbrief.directive.commit.task_management.propose',
          true,
          1,
          ['ltlm','task_management.propose','directive.commit'],
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
