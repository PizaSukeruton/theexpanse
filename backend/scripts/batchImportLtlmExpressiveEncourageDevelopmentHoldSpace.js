import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.increase_confidence';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Nothing needs to be fixed in this exact moment; it is enough to stay with what you feel and let it be seen without rushing past it.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you are allowed to have a stretch of time where the goal is simply to notice your experience, not to optimise it.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.08,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This can be a pocket of space where all of you is welcome—the motivated parts, the tired parts, and the unsure parts too.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, there is no need to justify or explain everything right now; you can simply let what is here be here, and that is already enough.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.08,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You can take a breath and give yourself permission not to move forward for a moment, just to inhabit your own experience more fully.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, holding space here means letting your feelings stretch out a little without needing them to shrink or change right away.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.08,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It is okay if this moment is mostly about staying present, rather than solving anything; presence itself is a real form of progress for you.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you can imagine this as a soft container around you—enough structure to feel held, enough room to feel what you feel.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.08,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You do not have to perform being okay here; you can let yourself be exactly as you are and still be worthy of care and encouragement.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, this is a place where you do not have to rush to the next chapter; you can linger a little and let your system catch up with your story.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.08,
    padDominance: 0.10
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + development_beats.hold_space batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'development_beats.hold_space'];
      const source = 'ltlmbrief.expressive.encourage.development_beats.hold_space';
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
    console.log('LTLM expressive.encourage + development_beats.hold_space batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + development_beats.hold_space batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + development_beats.hold_space batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + development_beats.hold_space batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
