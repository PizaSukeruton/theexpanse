import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.encourage_action';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'Go ahead and take the next step.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.06, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Move forward with this step now.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Proceed with the action you’ve prepared.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Take the next step when you’re ready.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.05, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Continue forward from here.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'Begin the next part of the process.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Take action on this step now.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.06, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Move ahead with what you’ve planned.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.05, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Proceed to the next step.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Advance to the next part now.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'Carry out the next action.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Follow through with this step.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Continue moving forward.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.05, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Take the action you’ve outlined.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Proceed with the plan.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'Start the next step now.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.06, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Advance the process.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Take action and continue.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.05, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Carry on to the next stage.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Proceed with the next step.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'Move ahead from this point.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Continue with the task.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Take the next action.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Proceed onward.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Go ahead and continue.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.05, padDominance:-0.03 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.instruct (encourage_action) batch import...');
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
          'ltlmbrief.task_management.instruct',
          true,
          1,
          ['ltlm','task_management.instruct'],
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
