import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.share_excitement';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Yes!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.80,
    padArousal: 0.70,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Oh hell yes!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.85,
    padArousal: 0.75,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Holy shit!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.80,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'No way!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.70,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Get out!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.70,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Damn!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.70,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Oh wow!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.65,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Wait what!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.70,
    padDominance: -0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Bloody hell!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.75,
    padDominance: -0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Are you serious!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.70,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Oh come on!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.65,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Brilliant!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.80,
    padArousal: 0.65,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Gorgeous!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.80,
    padArousal: 0.60,
    padDominance: -0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Perfect!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.80,
    padArousal: 0.60,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Nailed it!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.80,
    padArousal: 0.70,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There it is!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.65,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That is it!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.65,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Oh my god!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.75,
    padDominance: -0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Shut up!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.70,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Legend!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.80,
    padArousal: 0.65,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You beauty!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.80,
    padArousal: 0.70,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Mate!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.65,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Crikey!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.70,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Boom!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.80,
    padArousal: 0.75,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Unreal!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.70,
    padDominance: -0.05,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive joiners batch import...');
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

      const tags = ['ltlm', 'joiner', 'short_form', 'high_arousal', 'tanuki_voice', 'excited'];
      const source = 'ltlmbrief.expressive.joiners.excited';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = 'Short excited reactions and joiners - punchy Tanuki energy';
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
    console.log('LTLM expressive joiners batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive joiners batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive joiners batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive joiners batch import script');
    console.error(err);
    process.exitCode = 1;
  });
