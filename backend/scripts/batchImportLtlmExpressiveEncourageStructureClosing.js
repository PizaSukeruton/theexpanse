import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.increase_confidence';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'As we wrap this part up, remember that what you did here still counts, even if it felt small or imperfect from the inside.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.09,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, this is a good place to pause and give yourself credit for showing up, not just for whatever outcomes you reached.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.09,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You can let this chapter end with a tone of appreciation rather than criticism; that choice shapes how you remember this later.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.09,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, as this scene closes, you are allowed to carry forward the effort and let the self-judgment stay behind.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.09,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Ending here does not erase the work you have done; it simply marks a boundary so you can rest and return with more capacity next time.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.09,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you can let this close on a note of “I did what I could today,” which is often more than your inner critic admits.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.09,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'As this section ends, notice if there is even a small sense of relief or pride available, and allow yourself to register it for a moment.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.09,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, this is a gentle closing, not a verdict; you will have other chances to practice, and what you did here will support you then too.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.09,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You can let yourself exhale as this wraps up, knowing that simply engaging with this process is already part of your growth curve.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.09,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, as you step out of this piece of work, you can acknowledge: “I showed up for myself here,” and let that be the final note for now.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.09,
    padDominance: 0.13
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + structurebeats.closing batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'structurebeats.closing'];
      const source = 'ltlmbrief.expressive.encourage.structurebeats.closing';
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
    console.log('LTLM expressive.encourage + structurebeats.closing batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + structurebeats.closing batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + structurebeats.closing batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + structurebeats.closing batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
