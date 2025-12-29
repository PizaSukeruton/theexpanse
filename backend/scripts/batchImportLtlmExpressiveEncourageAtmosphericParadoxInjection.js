import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.increase_confidence';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'It is strange but often true that the moments you feel least capable are exactly when you are growing the most.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.paradox_injection',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.11,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it can be both true that this feels hard and true that you are the kind of person who can move through hard things.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.paradox_injection',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.12,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You can feel unsure and still be making exactly the kind of choices that build your future confidence.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.paradox_injection',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.11,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you can be tired and still be strong; those two states are not opposites here, they are coexisting truths.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.paradox_injection',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.12,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It is possible for this to matter a lot and for you not to have to get it perfectly right all at once.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.paradox_injection',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.11,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you can move gently and still be making real progress; slowness and effectiveness are not enemies here.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.paradox_injection',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.12,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You may feel like nothing is shifting, and yet your willingness to stay is already a significant shift.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.paradox_injection',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.11,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it can feel like you are going in circles while in reality you are slowly widening the path each time you come around.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.paradox_injection',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.12,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You can both wish this were easier and still choose to keep going in a way that honours your limits.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.paradox_injection',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.11,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it is possible to feel uncertain and still be exactly where you need to be in your own learning curve.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.paradox_injection',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.12,
    padDominance: 0.11
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + atmospheric.paradox_injection batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'atmospheric.paradox_injection'];
      const source = 'ltlmbrief.expressive.encourage.atmospheric.paradox_injection';
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
    console.log('LTLM expressive.encourage + atmospheric.paradox_injection batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + atmospheric.paradox_injection batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + atmospheric.paradox_injection batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + atmospheric.paradox_injection batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
