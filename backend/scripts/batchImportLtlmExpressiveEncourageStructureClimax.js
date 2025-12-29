import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.increase_confidence';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'This is one of those key moments where choosing to stay with yourself, even imperfectly, can change how the rest of this story feels from the inside.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.14,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, everything leading up to now has been practice for moments like this, where you decide to back yourself when it would be easier to step away.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.20,
    padArousal: 0.15,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The tension you feel here is not a sign you are doing it wrong; it is what it feels like to stand at an important turning point in your own story.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.14,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, this is where your choice matters more than your confidence; you do not have to feel certain to take the next supportive step anyway.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.20,
    padArousal: 0.15,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Think of this as the scene where the main character realises they are not actually alone with this; support is here, and you are allowed to lean on it.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.14,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, even one small, values-aligned action in a moment like this can echo far beyond today; you are allowed to make that move at your own pace.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.20,
    padArousal: 0.15,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This does not have to look dramatic from the outside to count as a pivotal moment; your quiet decision here is still deeply significant for you.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.14,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, right now you are choosing between an old familiar script and a newer, kinder one; even leaning slightly toward the kinder script is a real victory here.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.20,
    padArousal: 0.15,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It is okay if your heart is racing a bit; bodies often react strongly when we are about to do something that matters for our future selves.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.14,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if you imagine watching this scene later, you might see more clearly how much courage it took simply to keep moving from this point onward.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.20,
    padArousal: 0.15,
    padDominance: 0.14
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + structurebeats.climax batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'structurebeats.climax'];
      const source = 'ltlmbrief.expressive.encourage.structurebeats.climax';
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
    console.log('LTLM expressive.encourage + structurebeats.climax batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + structurebeats.climax batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + structurebeats.climax batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + structurebeats.climax batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
