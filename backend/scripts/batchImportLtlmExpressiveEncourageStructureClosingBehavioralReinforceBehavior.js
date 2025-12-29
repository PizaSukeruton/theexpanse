import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioraloutcomes.reinforcebehavior';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'The way you chose a small, workable step here is exactly the kind of behaviour that makes change sustainable over time.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.20,
    padArousal: 0.10,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, noticing your limits and adjusting your actions around them is a skillful response, not a failure; that is a behaviour worth repeating.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.20,
    padArousal: 0.10,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Each time you pause to check in with yourself before acting, you are reinforcing a pattern of thoughtful, self-respecting behaviour.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.10,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, choosing to take even one kind action for yourself today is a behaviour that deserves to be recognised and carried forward.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.20,
    padArousal: 0.10,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The way you turned reflection into a concrete step here is a pattern that can serve you again in other situations.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.11,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you practiced treating yourself with a bit more respect in this moment, and repeating that behaviour will keep strengthening it.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.20,
    padArousal: 0.10,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Choosing to step away before you were completely overwhelmed is a protective behaviour, and it counts as meaningful progress.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.10,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the way you reached for support instead of staying entirely alone with this is a brave behaviour that is worth reinforcing.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.20,
    padArousal: 0.11,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Every time you respond with a slightly kinder action toward yourself, you are training a new habit; today’s choice is one more repetition of that behaviour.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.20,
    padArousal: 0.10,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, letting “good enough for now” be acceptable here is a behaviour that can gradually loosen perfectionism’s grip, especially if you keep practicing it.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.11,
    padDominance: 0.15
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + structurebeats.closing + behavioraloutcomes.reinforcebehavior batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'structurebeats.closing', 'behavioraloutcomes.reinforcebehavior'];
      const source = 'ltlmbrief.expressive.encourage.structurebeats.closing.behavioraloutcomes.reinforcebehavior';
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
    console.log('LTLM expressive.encourage + structurebeats.closing + behavioraloutcomes.reinforcebehavior batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + structurebeats.closing + behavioraloutcomes.reinforcebehavior batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + structurebeats.closing + behavioraloutcomes.reinforcebehavior batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + structurebeats.closing + behavioraloutcomes.reinforcebehavior batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
