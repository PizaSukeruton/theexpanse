import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.increase_autonomy';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am actually allowed to say no here, and I need to use that option this time.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_capability',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.01,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you do have the option to decline this, even if part of you feels like you should say yes.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_capability',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.01,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It is within your rights to set this limit, even if it disappoints someone else.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_capability',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.01,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you are not required to say yes just because a request is made politely or urgently.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_capability',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.01,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You are allowed to choose how you spend your time and energy, and that includes declining this.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_capability',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.01,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it is valid for you to prioritise your own capacity, even if others would prefer a different answer.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_capability',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.01,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You have the option to say “this is too much for me right now” and hold that line.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_capability',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.01,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, your needs are enough reason to decline, even if you cannot offer a detailed justification.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_capability',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.01,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Choosing not to take this on is a decision you are allowed to make for yourself.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_capability',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: -0.01,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you are permitted to say no even when you care about the person asking.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.refusal_capability',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.01,
    padDominance: 0.09
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM saferefusal.refusal_capability batch import...');

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

      const tags = ['ltlm', 'social_obligations_management.apologise', 'saferefusal.refusal_capability'];
      const source = 'ltlmbrief.saferefusal.refusal_capability.social_obligations_management.apologise';
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
    console.log('LTLM saferefusal.refusal_capability batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM saferefusal.refusal_capability batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM saferefusal.refusal_capability batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM saferefusal.refusal_capability batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
