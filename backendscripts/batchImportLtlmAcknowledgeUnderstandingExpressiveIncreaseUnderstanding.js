import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.increase_understanding';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Okay, I understand what you mean.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.02,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That makes sense to me.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.02,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I see what you’re getting at.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.02,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Got it — that’s clear.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.02,
    padDominance: -0.06,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I follow what you’re saying.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.02,
    padDominance: -0.07,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'That clicks for me.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.02,
    padDominance: -0.06,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I see how that fits together.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.02,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That helps me understand.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.02,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Okay, I’m with you.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.02,
    padDominance: -0.06,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I understand the point you’re making.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.02,
    padDominance: -0.07,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'That’s clear now.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.02,
    padDominance: -0.06,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I see what you mean by that.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.02,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That explanation helps.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.02,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’ve got a clearer picture now.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.02,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I understand that better now.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.02,
    padDominance: -0.07,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'That makes things clearer.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.02,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m following you now.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.02,
    padDominance: -0.06,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That clears it up for me.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.02,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I see how you arrived at that.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.02,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That helps me follow your thinking.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.02,
    padDominance: -0.08,
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Okay, I understand that now.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.02,
    padDominance: -0.06,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That explanation makes sense.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.02,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I see how that works now.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.02,
    padDominance: -0.07,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That gives me a better understanding.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.02,
    padDominance: -0.08,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I understand what you’re saying now.',
    dialogueFunctionCode: 'auto_feedback.acknowledging_understanding',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.02,
    padDominance: -0.07,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM acknowledging_understanding expressive batch import...');
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
          'ltlmbrief.expressive.auto_feedback.acknowledging_understanding',
          true,
          1,
          ['ltlm','auto_feedback.acknowledging_understanding','expressive'],
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
