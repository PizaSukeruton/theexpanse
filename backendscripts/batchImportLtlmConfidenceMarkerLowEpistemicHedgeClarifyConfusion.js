import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'I’m not completely confident about this, so let me check the details.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I want to flag that I may be missing something here.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I’m not fully sure this is right, so I want to be careful.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I might need to double-check my understanding here.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I’m a bit unsure about this part and want to clarify.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },

  { speakerCharacterId:'700002', utteranceText:'I don’t want to overstate this since I’m not fully certain.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I may be mistaken, so let me frame this carefully.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I’m not entirely sure this applies in your case.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I want to note some uncertainty before going further.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I’m not fully confident this captures everything.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },

  { speakerCharacterId:'700002', utteranceText:'I should caveat that I’m not 100% sure here.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I’m uncertain enough that I want to double-check assumptions.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I may need more context to be confident about this.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I’m hesitant to be definitive without more clarity.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I want to be transparent that my confidence is low here.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },

  { speakerCharacterId:'700002', utteranceText:'I’m not fully certain this interpretation is correct.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I should flag some uncertainty before proceeding.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I may be oversimplifying, so I want to pause and clarify.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I’m not confident enough yet to state this strongly.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I want to signal some uncertainty before drawing conclusions.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },

  { speakerCharacterId:'700002', utteranceText:'I’m not entirely convinced yet and need to check details.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I may be missing edge cases here.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I’m not sure this fully addresses the situation.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I should acknowledge some uncertainty here.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I’m not confident enough yet to finalize this.', dialogueFunctionCode:'auto_feedback.confidence_marker_low', speechActCode:'assertive.epistemic_hedge', padPleasure:0.02, padArousal:0.02, padDominance:-0.07 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM auto_feedback.confidence_marker_low (assertive.epistemic_hedge / clarify_confusion) batch import...');
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
          'ltlmbrief.auto_feedback.confidence_marker_low',
          true,
          1,
          ['ltlm','auto_feedback.confidence_marker_low'],
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
