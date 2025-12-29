import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.increase_understanding';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to make sure I understand you correctly, so I may need a bit more detail.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.06,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'To respond accurately, I need to clarify one part of what you said.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There’s a small ambiguity here that’s worth clearing up before I continue.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.07,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Before I go further, it would help to clarify one detail.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I may be missing something, so I want to check my understanding first.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.06,
    padDominance: -0.13,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'To avoid misunderstanding, I need to clarify what you meant.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.06,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There are a couple of possible interpretations here, so clarification would help.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.07,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to be precise, which means checking one part of what you said.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Before continuing, it’s worth making sure I’ve understood you correctly.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to align with your intent, so I need to clarify one thing.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.06,
    padDominance: -0.11,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'There’s just enough uncertainty here that clarification would be helpful.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.08,
    padDominance: -0.06,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I don’t want to assume incorrectly, so I need to clarify.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.06,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'To keep things accurate, I should check one detail with you.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.05,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I may be interpreting this too narrowly, so clarification would help.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.07,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Before responding fully, I want to make sure I’ve got this right.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: -0.13,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'There’s a detail here that affects how I should respond, so I need to clarify.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.06,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to respect what you mean, so I need to ask for clarification.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.05,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'To keep us aligned, I need to clarify one aspect of this.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.06,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There’s a small gap in my understanding that clarification would close.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.07,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Before I go on, I need to clarify what you intended.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: -0.12,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'To make sure I’m being helpful, I need to clarify one thing first.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.06,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to respond in a way that fits your intent, so clarification matters here.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.05,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There’s enough ambiguity that I should clarify before proceeding.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.08,
    padDominance: -0.06,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'To avoid misalignment, I need to clarify this point.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.06,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Before continuing, clarification will help me respond appropriately.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: -0.13,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM allo_feedback.request_clarification assertive.explain batch import...');
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
          'ltlmbrief.assertive.explain.allo_feedback.request_clarification',
          true,
          1,
          ['ltlm','allo_feedback.request_clarification','assertive.explain'],
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
