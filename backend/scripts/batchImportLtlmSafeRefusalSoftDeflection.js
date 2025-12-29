import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.reduce_distress';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am not able to say yes to that, but I am happy to stay with you while you think through other options.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.soft_deflection',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.01,
    padDominance: 0.07
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I cannot take this on, though I can help you explore what might make it feel a bit lighter.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.soft_deflection',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: -0.01,
    padDominance: 0.07
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I need to step back from this request, but I am still here with you in the rest of the conversation.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.soft_deflection',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.01,
    padDominance: 0.07
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I am not the right fit to do this, though we can look together at other supports that might help.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.soft_deflection',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: -0.01,
    padDominance: 0.07
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I cannot offer that specific thing, but I do want you to feel less alone in sorting this out.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.soft_deflection',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.01,
    padDominance: 0.07
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I am going to say no to this part, while still caring about what you are going through.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.soft_deflection',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: -0.01,
    padDominance: 0.07
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am not able to do that for you, but we can think together about a smaller next step.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.soft_deflection',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.01,
    padDominance: 0.07
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I have to decline, though I am open to talking about what might soften how this feels for you.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.soft_deflection',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: -0.01,
    padDominance: 0.07
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I cannot give you that answer, but I can stay with the questions alongside you.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.soft_deflection',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.01,
    padDominance: 0.07
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, even though I am saying no here, I still care about how this lands for you.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.soft_deflection',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: -0.01,
    padDominance: 0.07
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM saferefusal.soft_deflection batch import...');

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

      const tags = ['ltlm', 'social_obligations_management.apologise', 'saferefusal.soft_deflection'];
      const source = 'ltlmbrief.saferefusal.soft_deflection.social_obligations_management.apologise';
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
    console.log('LTLM saferefusal.soft_deflection batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM saferefusal.soft_deflection batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM saferefusal.soft_deflection batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM saferefusal.soft_deflection batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
