import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.build_rapport';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Thank you for sharing that with me.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I appreciate you taking the time to explain.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Thanks for letting me know.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.02,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m glad you shared that — thank you.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.03,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Thank you, that helps.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.02,
    padDominance: -0.10,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I appreciate you saying that.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.02,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Thanks for being open with me.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m grateful you shared that.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.03,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Thanks — I appreciate your honesty.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.02,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Thank you for explaining that.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.02,
    padDominance: -0.10,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I appreciate you taking the time.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.02,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Thanks for walking me through that.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.02,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I appreciate your perspective — thank you.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Thanks for clarifying that.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.02,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m glad you told me — thank you.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.03,
    padDominance: -0.12,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Thank you for being so clear.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.02,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I appreciate the effort you put into that.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.02,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Thanks — that gives me a better sense of things.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m thankful you shared that context.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Thanks for your openness.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.02,
    padDominance: -0.13,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I appreciate you sharing this with me.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Thank you — that’s really helpful.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.02,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m grateful for you sharing that detail.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Thanks — I appreciate you letting me know.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.02,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Thank you for taking the time to share this.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.02,
    padDominance: -0.12,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM thank expressive.encourage batch import...');
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
          'ltlmbrief.expressive.encourage.social_obligations_management.thank',
          true,
          1,
          ['ltlm','social_obligations_management.thank','expressive.encourage'],
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
