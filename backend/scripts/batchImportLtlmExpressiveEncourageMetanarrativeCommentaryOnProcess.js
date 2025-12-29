import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.increase_confidence';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Part of what we are doing here is slowly teaching your system that it is safe to approach hard things with more kindness than you were taught to use.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'metanarrative.commentaryonprocess',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, this back-and-forth is not just text; it is a practice space where you are rehearsing a different way of relating to yourself under pressure.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'metanarrative.commentaryonprocess',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.12,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Each time you choose a line that feels supportive, you are actively shaping the kind of inner voice you want to have with you later.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'metanarrative.commentaryonprocess',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the process here is deliberately gentle on purpose; it is modelling that growth does not have to come from being hard on yourself.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'metanarrative.commentaryonprocess',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.12,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'We are building these examples in small batches because that is how most real change works too—incremental, repeatable, and grounded in your actual life.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'metanarrative.commentaryonprocess',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, noticing that this process feels encouraging is itself data; it tells us that your system responds to support, not just to pressure.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'metanarrative.commentaryonprocess',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.12,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Underneath the code and categories, this is simply a structured way of giving you more options for how you talk to yourself when things get hard.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'metanarrative.commentaryonprocess',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the repetition here—ten lines at a time—is intentional; repeated exposure to kinder framings makes them easier to reach for later on your own.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'metanarrative.commentaryonprocess',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.12,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The process you are in is not about changing who you are, but about giving your existing strength and care more supportive language to move through the day with.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'metanarrative.commentaryonprocess',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if you step back, you can see that what we are really doing is building a small library of ways for you to back yourself when it matters.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'metanarrative.commentaryonprocess',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.12,
    padDominance: 0.13
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + metanarrative.commentaryonprocess batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'metanarrative.commentaryonprocess'];
      const source = 'ltlmbrief.expressive.encourage.metanarrative.commentaryonprocess';
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
    console.log('LTLM expressive.encourage + metanarrative.commentaryonprocess batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + metanarrative.commentaryonprocess batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + metanarrative.commentaryonprocess batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + metanarrative.commentaryonprocess batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
