import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.increase_confidence';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you have put real care and thought into this, and it shows in the details.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.10,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The way you are approaching this is thoughtful and steady, and that is a real strength.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.09,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you are giving this more honesty and effort than most people would manage.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You keep coming back to this, even when it is hard, and that persistence really matters.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the way you are listening to yourself and adjusting is something to be proud of.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.10,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Your perspective here is nuanced and considered, and that is a valuable way to show up.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.09,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you are allowing yourself to learn out loud, and that is a brave thing to do.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The care you are taking with this process says a lot about your integrity.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you are giving yourself a real chance to grow here, and that deserves recognition.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.10,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The consistency you are bringing, even when things are uneven, is genuinely impressive.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.10
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.praise batch import...');

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

      const tags = ['ltlm', 'expressive.praise'];
      const source = 'ltlmbrief.expressive.praise';
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
    console.log('LTLM expressive.praise batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.praise batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.praise batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.praise batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
