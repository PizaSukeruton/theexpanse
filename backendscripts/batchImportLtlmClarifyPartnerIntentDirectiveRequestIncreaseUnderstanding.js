import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.increase_understanding';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Can you tell me a bit more about what you’re aiming for?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What’s the main goal you have in mind here?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you clarify what you’re hoping to achieve?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What outcome are you working toward with this?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Can you help me understand what your intention is?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.09,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'What are you trying to accomplish with this step?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you say more about the direction you’re aiming for?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What’s the intent behind that suggestion?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Can you clarify what you want to get out of this?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What’s the purpose you’re trying to serve here?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.07,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you explain the intent behind your approach?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What are you hoping will happen as a result?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Can you help me understand the intent behind this?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What’s the outcome you’re trying to reach?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you be a bit more explicit about your intent?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.10,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'What are you trying to move toward with this?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Can you clarify what success would look like here?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What’s the intent driving this choice?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you outline the goal you’re working toward?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What’s motivating this direction?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.07,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Can you help me see what you’re aiming for overall?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What’s the intention guiding this decision?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you explain the goal you’re trying to reach?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What’s the intended outcome from your point of view?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Can you clarify what you ultimately want to happen?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.10,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM clarify_partner_intent directive.request batch import...');
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
          'ltlmbrief.directive.request.partner_communication_management.clarify_partner_intent',
          true,
          1,
          ['ltlm','partner_communication_management.clarify_partner_intent','directive.request'],
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
