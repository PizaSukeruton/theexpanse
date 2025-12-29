import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.maintain_presence';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'How are you feeling about this so far?',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.04,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Does this feel okay for you at the moment?',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.03,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I just want to check in with you.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.03,
    padDominance: -0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'How is this landing for you right now?',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.04,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Are you feeling comfortable continuing?',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.03,
    padDominance: -0.13,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Let me know how you’re doing with this.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.03,
    padDominance: -0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Does this feel manageable for you?',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.04,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to make sure you’re okay with where we are.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.03,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'How are you feeling as we go through this?',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.04,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Is this pace working for you?',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.03,
    padDominance: -0.13,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m here with you — how are you doing?',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.03,
    padDominance: -0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Does anything feel off for you right now?',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.04,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to pause and check how you’re feeling.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.03,
    padDominance: -0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Are you still feeling okay moving forward?',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.03,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'How are things sitting with you?',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.04,
    padDominance: -0.12,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Just checking — are you alright with this?',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.03,
    padDominance: -0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Is this feeling supportive for you?',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.03,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'How are you holding up with this conversation?',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.04,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to make sure this feels okay for you.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.03,
    padDominance: -0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Does this still feel like a good direction?',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.04,
    padDominance: -0.12,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m checking in to see how this is feeling for you.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.03,
    padDominance: -0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Are you okay with how things are unfolding?',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.03,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m here — just let me know how this is for you.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.03,
    padDominance: -0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Does this still feel supportive?',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.03,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to stay aligned with how you’re feeling.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.03,
    padDominance: -0.14,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM confirm_partner_state expressive.encourage batch import...');
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
          'ltlmbrief.expressive.encourage.partner_communication_management.confirm_partner_state',
          true,
          1,
          ['ltlm','partner_communication_management.confirm_partner_state','expressive.encourage'],
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
