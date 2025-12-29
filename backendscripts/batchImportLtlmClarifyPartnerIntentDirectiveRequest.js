import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.increase_understanding';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Before we go further, can you clarify what you’re aiming to achieve?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.06,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What’s your main goal here?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.07,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Can you tell me what you’re hoping to get out of this?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.06,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What would a helpful outcome look like for you?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Just to be sure, what’s the intent behind this question?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.06,
    padDominance: -0.13,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Are you looking for an explanation, a suggestion, or something else?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.07,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What’s the direction you’d like this to go?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.06,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Can you help me understand your intent a bit more?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What are you hoping I focus on here?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.06,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What’s the core question you want answered?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.07,
    padDominance: -0.08,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Can you clarify what you’d like help with specifically?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.06,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What outcome are you working toward?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Are you seeking understanding, action, or confirmation?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.06,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What would you like me to prioritise in my response?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.05,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Can you clarify the intent behind what you just said?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.06,
    padDominance: -0.13,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'What’s the result you’re ultimately looking for?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Is your goal more about understanding or deciding something?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.06,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What do you want to walk away with after this?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Can you help me understand the intent driving this?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.06,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What’s the key thing you want addressed?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.07,
    padDominance: -0.09,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Are you hoping for guidance, explanation, or validation?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.06,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What’s the main intent you want me to respond to?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Can you specify what kind of help you’re looking for?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What would make this response most useful to you?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.05,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Can you clarify what you want to accomplish here?',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.06,
    padDominance: -0.11,
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
