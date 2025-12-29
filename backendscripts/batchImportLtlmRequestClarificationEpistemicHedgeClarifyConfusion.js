import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'I might be misunderstanding — could you clarify that part?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.04,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m not entirely sure I follow — can you say a bit more?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.04,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I may have missed something — could you clarify?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.04,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to be sure I understand — can you expand on that?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m not confident I’ve got this right — could you clarify?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.04,
    padDominance: -0.13,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Just to check my understanding — what did you mean there?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I might be off — can you clarify that point?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.04,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m unsure I’m interpreting this correctly — could you explain?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.04,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to double-check — can you clarify what you meant?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I may not be fully following — could you expand a little?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.04,
    padDominance: -0.12,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m not sure I’ve understood that correctly.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.04,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you clarify that part for me?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I may need a bit more detail to understand.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m uncertain I’ve got the full picture — can you clarify?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.04,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Just to be sure — could you explain that again?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.03,
    padDominance: -0.11,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I think I need a little more clarification there.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I may be misreading this — could you clarify?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.04,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m not sure I’m interpreting that correctly.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.04,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you clarify what you meant by that?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to check my understanding — can you clarify?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.03,
    padDominance: -0.11,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m not entirely certain I follow yet.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.04,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I think I need a bit more explanation.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you help clarify that for me?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I might need a little more detail to understand.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.03,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m not quite clear on that yet.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.epistemic_hedge',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.04,
    padDominance: -0.13,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM request_clarification assertive.epistemic_hedge batch import...');
    await client.query('BEGIN');

    for (const u of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');

      await client.query(
        `
        INSERT INTO ltlm_training_examples
        (training_example_id,
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
         created_by)
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        `,
        [
          trainingExampleId,
          u.speakerCharacterId,
          u.utteranceText,
          u.dialogueFunctionCode,
          u.speechActCode,
          null,
          u.padPleasure,
          u.padArousal,
          u.padDominance,
          null,
          'ltlmbrief.assertive.epistemic_hedge.allo_feedback.request_clarification',
          true,
          1,
          ['ltlm','allo_feedback.request_clarification','assertive.epistemic_hedge'],
          1.0,
          null,
          '700002',
        ]
      );

      const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');
      await client.query(
        `
        INSERT INTO ltlm_training_outcome_intents
        (ltlm_outcome_intent_id, training_example_id, outcome_intent_code)
        VALUES ($1,$2,$3)
        `,
        [outcomeIntentId, trainingExampleId, OUTCOME_INTENT_CODE]
      );
    }

    await client.query('COMMIT');
    console.log('LTLM batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM batch import failed.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => console.log('LTLM batch import script finished.'))
  .catch(err => {
    console.error('Unexpected error in LTLM batch import script');
    console.error(err);
    process.exitCode = 1;
  });
