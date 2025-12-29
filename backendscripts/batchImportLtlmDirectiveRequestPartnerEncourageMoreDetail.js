import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, could you tell me a little more about what feels unclear right now?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.08,
    padDominance: -0.18,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What part of this is still feeling fuzzy to you?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.06,
    padDominance: -0.20,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you’re up for it, what detail do you feel least sure about?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.07,
    padDominance: -0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you expand slightly on what you meant by that?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.05,
    padDominance: -0.22,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I might understand better if you shared one more detail.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.06,
    padDominance: -0.19,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What’s the piece of this that feels hardest to put into words?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.09,
    padDominance: -0.17,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Would you mind saying a bit more about where you’re getting stuck?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.08,
    padDominance: -0.16,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What do you think is missing from the picture so far?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.07,
    padDominance: -0.21,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you walk me through that part a little more slowly?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: -0.23,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you had to point to one unclear spot, which would it be?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.10,
    padDominance: -0.14,
  }
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM directive.request partner_communication_management.encourage_more_detail batch import...');
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
          'ltlmbrief.directive.request.partner_communication_management.encourage_more_detail',
          true,
          1,
          ['ltlm','partner_communication_management.encourage_more_detail','directive.request'],
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
