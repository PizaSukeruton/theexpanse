import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.increase_confidence';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let us take a small breath together and treat this moment as a fresh start, not a verdict on everything so far.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.room_reset',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.09,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, we can gently clear the mental table here and choose one small, supportive next move from where you are now.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.room_reset',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It is okay to pause, straighten the room in your head a little, and re-enter this task with a kinder frame.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.room_reset',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.09,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, imagine closing the door on that last frustrating moment and stepping back in with a bit more softness toward yourself.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.room_reset',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You are allowed to reset the tone here; this does not have to keep carrying the weight of earlier tension.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.room_reset',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.09,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, let us treat this like opening a window in a stuffy room so you can breathe and choose again.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.room_reset',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'We can set down the pressure to catch up and instead begin from the simple question of what would help you right now.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.room_reset',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.09,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it is completely valid to step back, re-orient, and come at this with a calmer, more grounded stance.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.room_reset',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Think of this as turning the page rather than rewriting the whole book; you get to start this page gently.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.room_reset',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.09,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, a soft reset here can give you more room to see your own capacity instead of just the stress.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.room_reset',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.11
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + anchor_mechanics.room_reset batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'anchor_mechanics.room_reset'];
      const source = 'ltlmbrief.expressive.encourage.anchor_mechanics.room_reset';
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
    console.log('LTLM expressive.encourage + anchor_mechanics.room_reset batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + anchor_mechanics.room_reset batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + anchor_mechanics.room_reset batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + anchor_mechanics.room_reset batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
