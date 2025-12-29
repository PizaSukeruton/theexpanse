import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'If this worked differently, the outcome would change.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'If the condition were different, you’d see another result.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'If this assumption were true, the behavior would look different.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.04, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'If that were the case, the process wouldn’t behave this way.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'If this factor were removed, the result would shift.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.04, padArousal:0.03, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'If the system behaved that way, you’d notice a different pattern.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'If this were happening, the steps would look different.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'If that assumption held, the outcome wouldn’t match this.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'If this condition applied, you’d expect a different response.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'If that were true, the system wouldn’t behave like this.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'If the rules were different, the process would change.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'If that interpretation were correct, the result would look different.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'If this worked the way you’re imagining, we’d see another outcome.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'If that were happening, the flow would be different.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.04, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'If this assumption applied, the behavior wouldn’t align.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'If the cause were different, the effect would change.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'If that condition existed, the steps wouldn’t line up.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.04, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'If the premise were accurate, the outcome would differ.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'If this scenario were true, the response would change.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'If that were the case, the result wouldn’t match what we see.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'If the system behaved that way, the output would change.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'If this assumption held, the pattern would look different.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'If the premise were valid, you’d see another result.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'If that interpretation applied, the behavior would differ.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'If things worked that way, the outcome wouldn’t align.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.counterfactual_scenario', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.explain (counterfactual / clarify_confusion) batch import...');
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
          'ltlmbrief.task_management.explain',
          true,
          1,
          ['ltlm','task_management.explain'],
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
