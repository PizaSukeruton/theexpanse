import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.increase_confidence';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Instead of seeing this as evidence that you are not capable, you could see it as proof that you are willing to grow at your own edge.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reframe',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, rather than “I am behind,” you might try “I am arriving at this in my own timing, with everything I have lived through so far.”',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reframe',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.12,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What looks like hesitation could also be read as your system carefully checking what is safe and sustainable for you, which is a strength.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reframe',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you can shift from “I am too much” or “not enough” to “I am learning what fits me and what does not,” which is far more accurate.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reframe',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.12,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This moment does not have to be a test of your worth; it can simply be one data point in understanding how you work best.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reframe',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, instead of “I keep messing this up,” you might try “I am in the part of learning where practice looks imperfect, which is normal.”',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reframe',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.12,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Your sensitivity here can be seen not as a flaw, but as evidence that you notice subtleties that some people would miss entirely.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reframe',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the fact that this challenges you can also mean it matters to you; that care is part of what makes your efforts meaningful, not a problem to erase.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reframe',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.12,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You could view today not as a setback, but as a training ground where you are learning how to stay kinder to yourself under strain.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reframe',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, instead of “I should be past this,” you might try “I am looping back with more wisdom than last time,” which is a different kind of progress.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reframe',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.12,
    padDominance: 0.12
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + development_beats.reframe batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'development_beats.reframe'];
      const source = 'ltlmbrief.expressive.encourage.development_beats.reframe';
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
    console.log('LTLM expressive.encourage + development_beats.reframe batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + development_beats.reframe batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + development_beats.reframe batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + development_beats.reframe batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
