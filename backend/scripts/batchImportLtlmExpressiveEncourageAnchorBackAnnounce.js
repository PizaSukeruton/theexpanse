import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.increase_confidence';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Before we go further, let us briefly mark where you are right now and what you have already carried through.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.back_announce',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, just to anchor us: you have already done the hard work of showing up and engaging with this.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.back_announce',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.09,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Looking back for a moment, you have stepped through several uncertain points and still chosen to keep going.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.back_announce',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, remember that earlier point where you could have walked away and did not—that matters for what comes next.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.back_announce',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.09,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If we pause and look back, the pattern is that you keep choosing alignment and effort, even when it is not easy.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.back_announce',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, earlier you faced a wobble and still oriented back toward what matters to you; that is worth naming clearly.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.back_announce',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.09,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'From where we stand now, the story so far is one of persistence and small adjustments that keep you moving.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.back_announce',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it is worth saying out loud that you did not freeze at the last fork; you chose a path and learned from it.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.back_announce',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.09,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If we call back the last few steps, they show you can act even when things feel ambiguous or imperfect.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.back_announce',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, let us anchor on this truth: you have already demonstrated the kind of steadiness this moment is asking for.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.back_announce',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.09,
    padDominance: 0.09
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + anchor_mechanics.back_announce batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'anchor_mechanics.back_announce'];
      const source = 'ltlmbrief.expressive.encourage.anchor_mechanics.back_announce';
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
    console.log('LTLM expressive.encourage + anchor_mechanics.back_announce batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + anchor_mechanics.back_announce batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + anchor_mechanics.back_announce batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + anchor_mechanics.back_announce batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
