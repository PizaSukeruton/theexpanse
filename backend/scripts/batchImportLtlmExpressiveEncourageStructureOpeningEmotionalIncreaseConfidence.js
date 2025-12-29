import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.increase_confidence';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'At the very start like this, it is enough that you are willing to look at this honestly; that willingness already says something good about you.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.12,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you do not have to feel completely ready before you begin; beginning while still unsure is a kind of courage you already have access to.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.12,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You have done hard new things before, even if they were different from this; that history comes with you into this opening moment.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.11,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it is okay to start small here; small does not mean insignificant, it means you are giving yourself a realistic first step.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.11,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If part of you doubts you can do this, that is understandable, and another part of you chose to be here anyway—that second part deserves some trust.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.13,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you do not need to impress anyone with how you start; the important thing is that you are starting in a way that is honest and workable for you.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.11,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It is completely valid if the first step is simply naming what you want from this; clarity about that is already a strong beginning.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.12,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you are allowed to bring your whole, imperfect self into this; you do not have to become a different person before you start doing what matters to you.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.12,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The fact that you are curious enough to try is already a strength; curiosity will carry you further than certainty at this stage.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.13,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you do not need proof in advance that this will work; you can let the proof accumulate as you take each next small, honest step.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.12,
    padDominance: 0.15
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + structure_beats.opening + emotional_outcomes.increase_confidence batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'structure_beats.opening', 'emotional_outcomes.increase_confidence'];
      const source = 'ltlmbrief.expressive.encourage.structure_beats.opening.emotional_outcomes.increase_confidence';
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
    console.log('LTLM expressive.encourage + structure_beats.opening + emotional_outcomes.increase_confidence batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + structure_beats.opening + emotional_outcomes.increase_confidence batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + structure_beats.opening + emotional_outcomes.increase_confidence batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + structure_beats.opening + emotional_outcomes.increase_confidence batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
