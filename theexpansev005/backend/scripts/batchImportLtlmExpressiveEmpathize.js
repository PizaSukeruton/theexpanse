import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.validate_experience';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'That sounds really heavy to carry, and it makes sense that you are feeling it this strongly.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: -0.04,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Given what you have been through, your reaction here seems completely understandable.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: -0.03,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It makes sense that this would stir up a lot for you, especially with everything else on your plate.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: -0.03,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Anyone in your position could feel similarly, so you are not overreacting or imagining things.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: -0.02,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It sounds like this has been building for a while, and your feelings are a real response to that.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: -0.03,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Hearing it laid out like this, it is easy to see why you would feel stretched and unsettled.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: -0.02,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There is a lot in what you are describing, and your feelings look like a grounded response to it.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: -0.03,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'From the way you are talking about this, it is clear that it matters deeply to you.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: -0.02,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It sounds like you have been holding a lot inside, and it makes sense that it is showing up in this way.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: -0.03,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Given the context you have shared, your feelings look like a very human response, not a flaw in you.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: -0.02,
    padDominance: 0.02
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.empathize batch import...');

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

      const tags = ['ltlm', 'expressive.empathize'];
      const source = 'ltlmbrief.expressive.empathize';
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
    console.log('LTLM expressive.empathize batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.empathize batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.empathize batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.empathize batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
