import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.increase_confidence';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'You have handled tough moments before, even if they looked different from this; that history is still on your side now.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'continuity_functions.callback_historical',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.10,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, remember how you found a way through that earlier patch when things felt heavy; this is another chapter, not a brand-new story.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'continuity_functions.callback_historical',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Think back to a time you surprised yourself with how you coped; that same part of you is still here, even if it feels far away right now.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'continuity_functions.callback_historical',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.10,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you have already lived through days that looked impossible from the inside; notice that you are still here, still learning, still moving.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'continuity_functions.callback_historical',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.11,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There have been times when you started unsure and grew more capable as you went; this can be another one of those arcs.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'continuity_functions.callback_historical',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.10,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, recall even one small example where you showed up for yourself; that memory is a real resource you get to draw on now.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'continuity_functions.callback_historical',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.11,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You have built skills and insights over years, not minutes; today is a place where those quiet investments can support you again.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'continuity_functions.callback_historical',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.10,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, think about how past-you kept going with far less support than you have now; it is okay to let that strengthen your trust in present-you a little.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'continuity_functions.callback_historical',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.11,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Your story already contains scenes where you adapted, learned, and tried again; this moment is woven into that same continuity, not separate from it.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'continuity_functions.callback_historical',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.10,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, let yourself borrow a little confidence from a version of you who has already made it through something hard; they are proof that you can grow into this too.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'continuity_functions.callback_historical',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.11,
    padDominance: 0.12
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + continuity_functions.callback_historical batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'continuity_functions.callback_historical'];
      const source = 'ltlmbrief.expressive.encourage.continuity_functions.callback_historical';
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
    console.log('LTLM expressive.encourage + continuity_functions.callback_historical batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + continuity_functions.callback_historical batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + continuity_functions.callback_historical batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + continuity_functions.callback_historical batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
