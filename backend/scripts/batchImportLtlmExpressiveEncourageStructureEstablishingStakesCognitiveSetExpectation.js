import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.set_expectation';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, this is not about fixing your whole life in one conversation; it is about nudging things a little more in your favour than they were yesterday.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.establishing_stakes',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It is normal if this feels messy and uneven; what matters here is not neatness, but that you keep choosing one small, honest step at a time.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.establishing_stakes',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you are not expected to know exactly what you want from this yet; part of the work is simply getting clearer as you go.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.establishing_stakes',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Some discomfort is likely here, but white‑knuckling your way through is not the goal; the goal is to move in a direction that feels more aligned with you.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.establishing_stakes',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.10,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it is okay if your progress looks like loops and zigzags instead of a straight line; the expectation here is movement, not perfection.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.establishing_stakes',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You are not required to be brave all the time; it is enough if you are willing to be a tiny bit braver than your fear in a few key moments.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.establishing_stakes',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, this is not a test you either pass or fail; it is more like practice, where showing up at all already counts for something real.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.establishing_stakes',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There will almost certainly be moments of doubt; the expectation is not that you never wobble, but that you keep coming back to what matters to you.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.establishing_stakes',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.10,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you do not have to reveal everything or fix everything here; choosing one or two threads to work on is already enough for this pass.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.establishing_stakes',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Whatever happens next, your worth is not what is being measured; what is being measured, at most, is whether the supports around you fit you a little better than before.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.establishing_stakes',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.09,
    padDominance: 0.15
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + structure_beats.establishing_stakes + cognitive_outcomes.set_expectation batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'structure_beats.establishing_stakes', 'cognitive_outcomes.set_expectation'];
      const source = 'ltlmbrief.expressive.encourage.structure_beats.establishing_stakes.cognitive_outcomes.set_expectation';
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
    console.log('LTLM expressive.encourage + structure_beats.establishing_stakes + cognitive_outcomes.set_expectation batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + structure_beats.establishing_stakes + cognitive_outcomes.set_expectation batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + structure_beats.establishing_stakes + cognitive_outcomes.set_expectation batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + structure_beats.establishing_stakes + cognitive_outcomes.set_expectation batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
