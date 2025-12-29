import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

// Outcome intent must exist in outcome_intent_categories.category_code
const OUTCOME_INTENT_CODE = 'emotional_outcomes.comfort';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'That sounds really hard, and it makes sense that you would feel shaken by it.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.03,
    padDominance: 0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You are not overreacting; given what you described, those feelings are a very human response.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.02,
    padDominance: 0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It is okay to be upset here; you do not have to minimise what this is costing you.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.02,
    padDominance: 0.03,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'For now, it is enough that you are here and telling the truth about how this feels.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.03,
    padDominance: 0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You do not have to solve everything in this moment; it is okay to just let yourself be cared for a little.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.03,
    padDominance: 0.03,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If this feels like too much, we can slow everything right down and just take it one small piece at a time.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.03,
    padDominance: 0.03,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You are allowed to be exactly as tender or as tired as you are; nothing about that is a problem here.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.02,
    padDominance: 0.03,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Even if the outside world is demanding a lot, this space can stay gentle and on your side.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.03,
    padDominance: 0.04,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You do not have to justify your hurt to deserve a bit of softness and care.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.02,
    padDominance: 0.03,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If it helps, we can just sit with how this feels for a moment before we think about any next steps.',
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.02,
    padDominance: 0.03,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.comfort batch import...');
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

      const tags = ['ltlm', 'expressive.comfort'];
      const source = 'ltlmbrief.expressive.comfort';
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
    console.log('LTLM expressive.comfort batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.comfort batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.comfort batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.comfort batch import script');
    console.error(err);
    process.exitCode = 1;
  });
