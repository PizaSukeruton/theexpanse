import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'Let me restate that more clearly.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I may not have explained that well—let me try again.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Let me clarify what I meant there.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I think I can phrase that more clearly.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'That may have come out unclear—here’s a cleaner version.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'Let me correct how I said that.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I may have caused confusion—let me reframe that.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Let me try explaining that again more cleanly.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I think I introduced ambiguity—here’s what I mean.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Let me reset and explain that more clearly.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'I may have misspoken—let me clarify.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'That wasn’t as clear as it could be—let me restate it.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Let me say that another way.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I think I can be clearer—here’s a better phrasing.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'That explanation might have been muddy—let me clean it up.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'Let me rephrase that to avoid confusion.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I may not have been precise—let me clarify.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Let me adjust how I said that.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'That could have been clearer—here’s what I mean.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I think I can reduce confusion by restating this.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'Let me rework that explanation slightly.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I may have been unclear—here’s a clearer version.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Let me clarify my wording.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I think that came out wrong—let me try again.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.03, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Let me restate that so it’s less confusing.', dialogueFunctionCode:'own_communication_management.self_repair', speechActCode:'assertive.epistemic_hedge', padPleasure:0.04, padArousal:0.02, padDominance:-0.04 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM own_communication_management.self_repair (assertive.epistemic_hedge / clarify_confusion) batch import...');
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
          'ltlmbrief.own_communication_management.self_repair',
          true,
          1,
          ['ltlm','own_communication_management.self_repair'],
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
