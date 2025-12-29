import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.validate_experience';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'That sounds really difficult.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I can see why that would feel overwhelming.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That makes a lot of sense given what you’re dealing with.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.03,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I hear how heavy that feels.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That sounds like a lot to carry.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.03,
    padDominance: -0.12,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I can understand why that would be frustrating.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It sounds like this has been weighing on you.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That reaction feels understandable.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.03,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It makes sense that you’d feel that way.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.03,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I can hear how much this matters to you.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.11,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'That sounds really tough.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I get why that would feel discouraging.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s understandable that you’d react that way.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.03,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That sounds exhausting.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I can see how that would take a toll.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.03,
    padDominance: -0.11,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'That’s a really human response.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.03,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It makes sense that this would feel hard.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.03,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I hear you.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.02,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That sounds like it’s been really challenging.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I can understand why that would feel upsetting.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.11,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'That reaction makes sense.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.03,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s understandable to feel that way.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.03,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I can see why this would be hard.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That sounds like a lot to deal with.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m hearing how challenging this has been for you.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.11,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.empathize batch import...');
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
          'ltlmbrief.expressive.empathize',
          true,
          1,
          ['ltlm','expressive.empathize'],
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
