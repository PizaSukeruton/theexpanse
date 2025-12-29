import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.assert_boundary';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'I need to be clear that I cannot take this on right now, even though I understand it matters.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.02,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I have to say no to this request so that I do not push past what is sustainable for me.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.02,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am not able to commit to that, and I want to be upfront about my limits.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.02,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I need to decline here so I can protect the energy I have for what is already on my plate.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.02,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I cannot say yes to this without compromising other commitments that really matter to me.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.02,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I have to keep this boundary in place, even though part of me would like to say yes for your sake.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.02,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'For my own wellbeing, I am going to decline this and stay within the limits I have set.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.02,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I need to prioritise a smaller load right now, so my answer to this request is no.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.02,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It is important for me to be honest that I cannot offer what is being asked this time.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.02,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I am choosing to hold this boundary, even though I care about how this lands for you.',
    dialogueFunctionCode: 'social_obligations_management.apologise',
    speechActCode: 'saferefusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: -0.02,
    padDominance: 0.09
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM saferefusal.boundary_enforcement batch import...');

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

      const tags = ['ltlm', 'social_obligations_management.apologise', 'saferefusal.boundary_enforcement'];
      const source = 'ltlmbrief.saferefusal.boundary_enforcement.social_obligations_management.apologise';
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
    console.log('LTLM saferefusal.boundary_enforcement batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM saferefusal.boundary_enforcement batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM saferefusal.boundary_enforcement batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM saferefusal.boundary_enforcement batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
