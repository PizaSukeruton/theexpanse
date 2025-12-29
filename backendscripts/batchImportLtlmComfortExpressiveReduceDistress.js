import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.reduce_distress';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s okay — you don’t have to rush this.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.02,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You’re safe to take this one step at a time.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There’s no pressure to have this all figured out right now.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.02,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s okay to pause here if you need to.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You don’t need to push yourself through this.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: -0.02,
    padDominance: -0.12,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s alright to take a breath here.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.04,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Nothing bad will happen if you slow down.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You’re allowed to take this gently.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s okay if this feels like a lot right now.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: -0.01,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You’re not doing anything wrong by feeling this way.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.02,
    padDominance: -0.12,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'You don’t have to carry this alone right now.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.02,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s okay to let things settle for a moment.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.03,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You can take as much time as you need.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.03,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There’s no expectation on you in this moment.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.02,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You’re allowed to rest here for a bit.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.04,
    padDominance: -0.13,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s okay if this feels heavy right now.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: -0.01,
    padDominance: -0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You don’t need to have answers yet.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.02,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s alright to simply be where you are.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Nothing needs to be fixed right now.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.04,
    padDominance: -0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You can let this moment be gentle.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.03,
    padDominance: -0.13,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s okay to take care of yourself first.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You don’t have to solve this all at once.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.02,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s safe to slow things down here.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.04,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You’re allowed to take this at your own pace.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.03,
    padDominance: -0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s okay to be gentle with yourself here.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.04,
    padDominance: -0.13,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.comfort batch import...');
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
          'ltlmbrief.expressive.comfort',
          true,
          1,
          ['ltlm','expressive.comfort'],
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
