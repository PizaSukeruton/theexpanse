import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.increase_understanding';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to make sure I’m following — can you clarify this part?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m unclear on how this step fits in — could you explain?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.05,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I understand most of it, but this part isn’t clear to me yet.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m missing how this connects — can you help clarify?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.05,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m not fully seeing the link here — could you explain that part?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.05,
    padDominance: -0.11,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'There’s one detail I’m unclear on — can you expand on it?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to be sure I understand this correctly — could you clarify?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.04,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m following so far, but this piece isn’t clear to me.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you clarify what you mean by that part?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I think I get the idea, but I’m unclear on the details.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.04,
    padDominance: -0.11,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m not sure I understand this section yet.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.04,
    padDominance: -0.12,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you help clarify what’s happening at this point?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I need a bit more explanation to fully understand this.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There’s a gap in my understanding here — can you clarify?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.04,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m not fully grasping this part yet.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.04,
    padDominance: -0.12,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you explain this part in a bit more detail?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m unsure how to interpret this section.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.04,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to make sure I’m understanding you correctly here.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.03,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I could use a bit more explanation on this point.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.03,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m still unclear on how this works.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.04,
    padDominance: -0.12,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you help fill in this gap for me?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.04,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m missing part of the reasoning here.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.04,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I don’t quite see how this fits yet.',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.04,
    padDominance: -0.11,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Could you clarify the reasoning behind this?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: -0.09,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m not fully clear on this yet — could you explain further?',
    dialogueFunctionCode: 'allo_feedback.request_clarification',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.04,
    padDominance: -0.12,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM request_clarification assertive.explain batch import...');
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
