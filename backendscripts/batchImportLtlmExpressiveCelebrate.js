import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.mark_achievement';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'You did it! This is genuinely wonderful!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.50,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, this calls for a moment of celebration — what an achievement!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.55,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Yes! That is exactly the kind of result worth celebrating!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, take a breath and let yourself feel this — you earned it!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.50,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This is a real milestone — I am genuinely happy for you!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.45,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, what a moment! This deserves to be recognised!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I knew you could do it, and here we are — celebrating together!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.50,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, this is exactly the kind of win that matters — well done!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.50,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What an accomplishment! Let yourself enjoy this moment fully!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.55,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you made this happen — and that is something to celebrate!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.50,
    padDominance: 0.05,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.celebrate batch import...');
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

      const tags = ['ltlm', 'expressive.celebrate', 'expressive.praise', 'high_arousal'];
      const source = 'ltlmbrief.expressive.praise.expressive.celebrate';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = 'High-energy celebration utterance for matching user joy';
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
    console.log('LTLM expressive.celebrate batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.celebrate batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.celebrate batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.celebrate batch import script');
    console.error(err);
    process.exitCode = 1;
  });
