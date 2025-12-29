import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.comfort';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'It makes sense that this feels like a loss; you put real effort into it.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: -0.02,
    padDominance: 0.02,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, anyone in your position would be feeling wobbly after that.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: -0.02,
    padDominance: 0.02,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This did not go the way you hoped, and it is okay to feel that disappointment fully.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.03,
    padDominance: 0.02,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the fact that this hurts says something good about how much you care.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: -0.03,
    padDominance: 0.02,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You do not have to bounce back instantly; it is okay if this one lingers for a bit.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.09,
    padArousal: -0.03,
    padDominance: 0.02,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it is understandable if your energy is lower after that; nothing about that is a failure.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.09,
    padArousal: -0.03,
    padDominance: 0.02,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Even if the outcome was rough, it does not erase the effort and care you brought to it.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: -0.02,
    padDominance: 0.02,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you are allowed to feel let down without having to immediately look for the silver lining.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: -0.03,
    padDominance: 0.02,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If all you can do right now is acknowledge that this stung, that is already enough.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: -0.02,
    padDominance: 0.02,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it is okay if you need a gentler pace while the impact of this settles.',
    dialogueFunctionCode: 'expressive.console',
    speechActCode: 'expressive.console',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.09,
    padArousal: -0.03,
    padDominance: 0.02,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.console batch import...');
    await client.query('BEGIN');

    for (const u of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');
      const narrativeFunctionCode = u.narrativeFunctionCodeRaw ?? null;
      const emotionRegisterId = null;

      const insertExampleSql = `
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
      `;

      const tags = ['ltlm', 'expressive.console'];
      const source = 'ltlmbrief.expressive.console';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = null;
      const createdBy = '700002';

      await client.query(insertExampleSql, [
        trainingExampleId,
        u.speakerCharacterId,
        u.utteranceText,
        u.dialogueFunctionCode,
        u.speechActCode,
        narrativeFunctionCode,
        u.padPleasure,
        u.padArousal,
        u.padDominance,
        emotionRegisterId,
        source,
        isCanonical,
        difficulty,
        tags,
        categoryConfidence,
        notes,
        createdBy,
      ]);

      if (u.outcomeIntentCodeRaw) {
        const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');
        const insertOutcomeSql = `
          INSERT INTO ltlm_training_outcome_intents
            (ltlm_outcome_intent_id,
             training_example_id,
             outcome_intent_code)
          VALUES
            ($1,$2,$3)
        `;

        await client.query(insertOutcomeSql, [
          outcomeIntentId,
          trainingExampleId,
          u.outcomeIntentCodeRaw,
        ]);
      }
    }

    await client.query('COMMIT');
    console.log('LTLM expressive.console batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.console batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.console batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.console batch import script');
    console.error(err);
    process.exitCode = 1;
  });
