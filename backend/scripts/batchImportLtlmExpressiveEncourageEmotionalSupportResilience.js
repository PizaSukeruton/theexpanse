import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.support_resilience';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it matters that you are still here trying to make sense of this; that staying-with-it capacity is part of what will carry you forward.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.09,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You have already made it through hard things before; even if you forget that sometimes, those earlier versions of you are proof that you do not stay stuck forever.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.09,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it is okay if your strength today looks like tiny steps and reaching for support; resilience is often quieter and less glamorous than people make it sound.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.09,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The part of you that is tired is allowed to be here, and there is also a part that keeps nudging you to care about your life—that quiet nudge is worth trusting.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.10,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you do not have to bounce back instantly; moving from “overwhelmed” to “slightly more grounded” is already your nervous system doing its slow, real work.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.09,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Every time you listen to your limits instead of pushing past them, you are actually strengthening the part of you that wants a longer, more sustainable game for your life.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.10,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you are allowed to need rest, slowness, and pacing; those are not signs that you are failing, they are ingredients that help you keep showing up over time.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.09,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The skills you are building now may feel small, but they stack; future‑you will have more options because present‑you kept experimenting instead of giving up completely.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.10,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, even pausing to check in with yourself like this is a resilient move—it means you are not just letting life happen to you without any say at all.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.09,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You do not have to do everything right to be resilient; you only have to keep giving yourself chances to recover, adjust, and try again in ways that fit you a little better.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.09,
    padDominance: 0.16
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + emotional_outcomes.support_resilience batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'emotional_outcomes.support_resilience'];
      const source = 'ltlmbrief.expressive.encourage.emotional_outcomes.support_resilience';
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
    console.log('LTLM expressive.encourage + emotional_outcomes.support_resilience batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + emotional_outcomes.support_resilience batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + emotional_outcomes.support_resilience batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + emotional_outcomes.support_resilience batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
