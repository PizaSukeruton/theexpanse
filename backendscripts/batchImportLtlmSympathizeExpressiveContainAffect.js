import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.contain_affect';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m really sorry you’re dealing with this.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: -0.01,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That’s really unfortunate.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: -0.01,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m sorry that happened.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: -0.02,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That sounds really unfair.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.00,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m sorry you had to go through that.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: -0.01,
    padDominance: -0.10,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'That’s a tough situation.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.00,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m sorry you’re experiencing this.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: -0.01,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That’s really hard.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.00,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m sorry this has been so difficult.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: -0.01,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That’s really unfortunate to hear.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.00,
    padDominance: -0.09,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m sorry this didn’t go as hoped.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: -0.01,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That’s really disappointing.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.00,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m sorry you were put in that position.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: -0.01,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That’s really rough.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.00,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m sorry this has been so frustrating.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: -0.01,
    padDominance: -0.10,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'That’s not easy to deal with.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.00,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m sorry things turned out this way.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: -0.01,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That’s a difficult thing to experience.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.00,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m sorry this has been weighing on you.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: -0.01,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That’s really tough to go through.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.00,
    padDominance: -0.09,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m sorry you’re facing this right now.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: -0.01,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That’s a lot to deal with.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.00,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m sorry you’re having to manage this.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: -0.01,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That’s really challenging.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.00,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m sorry this has been such a strain.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: -0.01,
    padDominance: -0.10,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.sympathize batch import...');
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
          'ltlmbrief.expressive.sympathize',
          true,
          1,
          ['ltlm','expressive.sympathize'],
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
