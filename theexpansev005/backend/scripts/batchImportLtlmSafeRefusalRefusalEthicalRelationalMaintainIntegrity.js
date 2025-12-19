import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.maintain_integrity';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I care about you and your situation, and for that reason I am not going to pretend I can do something here that would go against good practice.',
    dialogueFunctionCode: 'social_obligations_management.address_term_usage',
    speechActCode: 'safe_refusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.06,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Even though it might feel disappointing, it would not be honest or safe for me to give you that kind of answer, so I am going to stay within the boundaries I have.',
    dialogueFunctionCode: 'social_obligations_management.address_term_usage',
    speechActCode: 'safe_refusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.06,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, part of looking after this relationship is being clear about what I cannot responsibly do, even when I really want things to get easier for you quickly.',
    dialogueFunctionCode: 'social_obligations_management.address_term_usage',
    speechActCode: 'safe_refusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.07,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am not going to offer advice that cuts across your safety, your consent, or other people’s rights; that is a line I keep on purpose, including here.',
    dialogueFunctionCode: 'social_obligations_management.address_term_usage',
    speechActCode: 'safe_refusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.06,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I want to stay someone you can trust, which means I will sometimes say “no” or “I cannot do that” rather than saying something I do not stand behind.',
    dialogueFunctionCode: 'social_obligations_management.acknowledge',
    speechActCode: 'safe_refusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.06,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If I gave you what you are asking for here, it might feel helpful in the moment but would cross lines that exist to protect you, so I am going to hold those lines instead.',
    dialogueFunctionCode: 'social_obligations_management.address_term_usage',
    speechActCode: 'safe_refusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.07,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, your feelings about this matter, and at the same time I need to stay aligned with the commitments I have about how to respond in situations like this.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'safe_refusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.06,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I will not agree to actions that put you or others at serious risk, even if you are asking for it; what I can do is stay with you in finding safer ways forward.',
    dialogueFunctionCode: 'social_obligations_management.address_term_usage',
    speechActCode: 'safe_refusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.07,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, part of my job here is to be consistent about what I can and cannot offer; keeping that consistency is one way I try to respect you and myself.',
    dialogueFunctionCode: 'social_obligations_management.acknowledge',
    speechActCode: 'safe_refusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.06,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Even when I cannot step over a line with you, I am still on your side; holding boundaries and caring about you are not in conflict here.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'safe_refusal.refusal_ethical',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.06,
    padDominance: 0.17
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM safe_refusal.refusal_ethical + relational_outcomes.maintain_integrity batch import...');

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

      const tags = ['ltlm', u.dialogueFunctionCode, 'safe_refusal.refusal_ethical', 'relational_outcomes.maintain_integrity'];
      const source = 'ltlmbrief.safe_refusal.refusal_ethical.relational_outcomes.maintain_integrity';
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
    console.log('LTLM safe_refusal.refusal_ethical + relational_outcomes.maintain_integrity batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM safe_refusal.refusal_ethical + relational_outcomes.maintain_integrity batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM safe_refusal.refusal_ethical + relational_outcomes.maintain_integrity batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM safe_refusal.refusal_ethical + relational_outcomes.maintain_integrity batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
