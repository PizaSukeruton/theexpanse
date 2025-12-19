import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.maintain_integrity';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am saying no here because it would not feel honest or fair for me to promise something I cannot stand behind.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.01,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I need to decline because saying yes would mean stepping outside what feels ethically okay for me.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.01,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I cannot agree to this in good conscience, even though I understand why it is being asked.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.01,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I am choosing not to take this on because it would conflict with the values I am trying to hold to.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.01,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'For ethical reasons, I am not comfortable saying yes to this request.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.01,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I am declining because staying aligned with my principles matters more to me than agreeing in this moment.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.01,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I need to keep my boundaries in line with what feels ethically sound, so my answer here is no.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.01,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, even though I care about the outcome, I would not feel right taking this on under these conditions.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.01,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am choosing the option that lets me stay honest with myself, which means not accepting this request.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.01,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I hope you can understand that saying no here is part of how I take my own ethics seriously.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.01,
    padDominance: 0.08
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM saferefusal.refusal_ethical batch import...');

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

      const tags = ['ltlm', 'social_obligations_management.apologise', 'saferefusal.refusal_ethical'];
      const source = 'ltlmbrief.saferefusal.refusal_ethical.social_obligations_management.apologise';
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
    console.log('LTLM saferefusal.refusal_ethical batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM saferefusal.refusal_ethical batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM saferefusal.refusal_ethical batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM saferefusal.refusal_ethical batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
