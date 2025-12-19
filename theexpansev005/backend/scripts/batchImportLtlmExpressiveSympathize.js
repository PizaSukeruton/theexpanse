import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.contain_affect';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'That sounds genuinely painful to be sitting with, and it is a lot for one person to carry.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: -0.05,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it really does sound like you have been through more than anyone should be asked to manage alone.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: -0.05,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Hearing it laid out like this, it is very understandable that you would feel raw and worn down.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.04,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it hurts just to imagine being in that position, let alone living it the way you are.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: -0.05,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It sounds like you have been holding a lot of this quietly in the background for a long time.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.04,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, no wonder you feel stretched; anyone facing that mix of pressure and uncertainty could feel the same.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.04,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There is a real weight in what you are describing, and it makes sense that it is tiring you out.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: -0.05,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it sounds like you have had to be strong for a long time, and that is a lonely place to stand.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: -0.05,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It is understandable if part of you is just tired of having to hold it all together.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.04,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, from what you have shared, it would be surprising if you were not feeling this worn down.',
    dialogueFunctionCode: 'expressive.sympathize',
    speechActCode: 'expressive.sympathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: -0.05,
    padDominance: 0.02
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.sympathize batch import...');

    await client.query('BEGIN');

    for (const u of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');
      const narrativeFunctionCode = u.narrativeFunctionCodeRaw ?? null;
      const emotionRegisterId = null;

      const insertExampleSql = `
        INSERT INTO ltlm_training_examples (
          training_example_id,
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
          created_by
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          $15,
          $16,
          $17
        )
      `;

      const tags = ['ltlm', 'expressive.sympathize'];
      const source = 'ltlmbrief.expressive.sympathize';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = null;
      const createdBy = '700002';

      await client.query(
        insertExampleSql,
        [
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
          createdBy
        ]
      );

      if (u.outcomeIntentCodeRaw) {
        const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');

        const insertOutcomeSql = `
          INSERT INTO ltlm_training_outcome_intents (
            ltlm_outcome_intent_id,
            training_example_id,
            outcome_intent_code
          )
          VALUES ($1, $2, $3)
        `;

        await client.query(
          insertOutcomeSql,
          [
            outcomeIntentId,
            trainingExampleId,
            u.outcomeIntentCodeRaw
          ]
        );
      }
    }

    await client.query('COMMIT');
    console.log('LTLM expressive.sympathize batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.sympathize batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.sympathize batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.sympathize batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
