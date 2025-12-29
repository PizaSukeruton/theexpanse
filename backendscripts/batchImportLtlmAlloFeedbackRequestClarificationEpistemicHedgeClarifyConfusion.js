import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'I might be misunderstanding—could you clarify what you mean?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I could be off here, so I want to check what you’re referring to.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Just to be sure I’m not misreading this, can you clarify?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I want to confirm my understanding before responding—could you clarify?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I may be missing some context here—can you clarify?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.06 },

  { speakerCharacterId:'700002', utteranceText:'I’m not fully certain I understand what you mean—could you clarify?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Before I assume, I want to check that I understand you correctly.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I could be interpreting this wrong—can you clarify your intent?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Just checking that I’m following you correctly—could you clarify?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I want to avoid misunderstanding—can you clarify that point?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'I may not be grasping the nuance—could you clarify?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I’m unsure if I’m interpreting this as you intended—can you clarify?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Just to ground my understanding, could you clarify?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I might be filling in gaps incorrectly—can you clarify?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I want to double-check my reading of this—could you clarify?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'I’m not completely confident I understand—can you clarify?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Before I respond, I want to confirm what you mean.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I may be misinterpreting this—could you clarify?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I want to make sure I understand your meaning correctly.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Just to avoid confusion, can you clarify what you mean?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'I might be drawing the wrong conclusion—could you clarify?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I’m not entirely sure I’m aligned with your meaning—can you clarify?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I want to check my understanding before moving forward.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I may be missing a key detail—could you clarify?', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Before I continue, I want to make sure I understand you correctly.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM allo_feedback.request_clarification (assertive.epistemic_hedge / clarify_confusion) batch import...');
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
          'ltlmbrief.allo_feedback.request_clarification',
          true,
          1,
          ['ltlm','allo_feedback.request_clarification'],
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
