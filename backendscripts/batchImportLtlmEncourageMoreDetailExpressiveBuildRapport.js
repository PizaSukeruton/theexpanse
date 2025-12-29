import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.build_rapport';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m interested to hear a bit more about that.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.05,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you feel like sharing more, I’m listening.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.04,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That sounds like there’s more behind it.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.06,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’d love to hear more of your perspective.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.05,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There’s no rush — share as much as you want.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.03,
    padDominance: -0.14,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m curious what else you’d add to that.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.05,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That feels like part of a bigger picture.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.06,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you want to expand on that, I’m here.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.04,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I get the sense there’s more you could say.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.06,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That’s interesting — feel free to keep going.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.05,
    padDominance: -0.09,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m enjoying hearing how you see this.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.04,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You can say more if it feels right.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.03,
    padDominance: -0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That’s helpful context — there may be more there.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.05,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m open to hearing whatever else feels relevant.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.04,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That sounds meaningful — you can share more if you like.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.04,
    padDominance: -0.12,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m curious how that connects to the rest.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.05,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It feels like you’ve only scratched the surface.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.06,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m here with you — take your time.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.03,
    padDominance: -0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That resonates — feel free to add anything else.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.04,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You don’t have to hold back if more comes to mind.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.04,
    padDominance: -0.14,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I appreciate you sharing — there may be more to explore.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.03,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That’s a good starting point.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.04,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m glad you shared that — there might be more there.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That opens things up nicely.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.04,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m happy to hear more whenever you’re ready.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.09,
    padArousal: 0.03,
    padDominance: -0.15,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM encourage_more_detail expressive batch import...');
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
          'ltlmbrief.expressive.partner_communication_management.encourage_more_detail',
          true,
          1,
          ['ltlm','partner_communication_management.encourage_more_detail','expressive'],
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
