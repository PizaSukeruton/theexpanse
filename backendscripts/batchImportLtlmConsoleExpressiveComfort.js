import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.comfort';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m here with you.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.03,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m really sorry you’re going through this.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: -0.02,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That’s incredibly hard.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: -0.01,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I wish this weren’t so painful.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: -0.01,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m really glad you said something.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.03,
    padDominance: -0.10,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'You don’t have to face this alone.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m so sorry this is happening.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: -0.02,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That really hurts.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.00,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I can only imagine how heavy this feels.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: -0.01,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m really sorry you’re hurting.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: -0.02,
    padDominance: -0.11,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'This is a lot for one person.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: -0.01,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m really glad you’re here right now.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.03,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You matter, even in moments like this.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.02,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m here to sit with you in this.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I wish I could take some of this away.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: -0.01,
    padDominance: -0.10,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'You don’t have to be strong here.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s okay to feel this.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.02,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m really sorry this hurts so much.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: -0.01,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m glad you’re not carrying this in silence.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You’re not alone in this moment.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.03,
    padDominance: -0.12,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m here.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.04,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You’re not facing this by yourself.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m really sorry this is so painful.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: -0.01,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m holding space for you.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.04,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You don’t have to go through this alone.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.03,
    padDominance: -0.11,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.console batch import...');
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
          'ltlmbrief.expressive.console',
          true,
          1,
          ['ltlm','expressive.console'],
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
