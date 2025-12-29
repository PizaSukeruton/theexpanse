import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.express_care';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'I genuinely wish for you to have more pockets of ease than strain as you move through this.',
    dialogueFunctionCode: 'expressive.wish',
    speechActCode: 'expressive.wish',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.04,
    padDominance: 0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, my hope is that you find people and places where you do not have to carry all of this alone.',
    dialogueFunctionCode: 'expressive.wish',
    speechActCode: 'expressive.wish',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.04,
    padDominance: 0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I wish for you to have enough steadiness around you that taking the next step feels possible, not overwhelming.',
    dialogueFunctionCode: 'expressive.wish',
    speechActCode: 'expressive.wish',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.03,
    padDominance: 0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it would mean a lot to see you treated with the same patience you offer other people.',
    dialogueFunctionCode: 'expressive.wish',
    speechActCode: 'expressive.wish',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.04,
    padDominance: 0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I wish for your efforts here to be recognised, even if most of the work is invisible from the outside.',
    dialogueFunctionCode: 'expressive.wish',
    speechActCode: 'expressive.wish',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.04,
    padDominance: 0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, my hope is that you get more moments where you can actually feel how far you have already come.',
    dialogueFunctionCode: 'expressive.wish',
    speechActCode: 'expressive.wish',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.04,
    padDominance: 0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I wish that you could have a little more room to breathe than the situation has been giving you lately.',
    dialogueFunctionCode: 'expressive.wish',
    speechActCode: 'expressive.wish',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.03,
    padDominance: 0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I hope you find people who can meet you where you are, instead of asking you to compress yourself.',
    dialogueFunctionCode: 'expressive.wish',
    speechActCode: 'expressive.wish',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.04,
    padDominance: 0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I wish for you to have at least a few spaces where you can be exactly as you are without editing anything out.',
    dialogueFunctionCode: 'expressive.wish',
    speechActCode: 'expressive.wish',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.04,
    padDominance: 0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, my hope is that you get to feel not just “coping” but occasionally genuinely supported and at ease.',
    dialogueFunctionCode: 'expressive.wish',
    speechActCode: 'expressive.wish',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.04,
    padDominance: 0.05
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.wish batch import...');

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

      const tags = ['ltlm', 'expressive.wish'];
      const source = 'ltlmbrief.expressive.wish';
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
    console.log('LTLM expressive.wish batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.wish batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.wish batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.wish batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
