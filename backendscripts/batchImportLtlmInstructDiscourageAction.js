import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.discourage_action';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'Pause here instead of continuing.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.02, padArousal:-0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Stop at this point and don’t proceed further.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.01, padArousal:-0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Do not move forward with this step.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.01, padArousal:-0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Hold off and avoid taking action right now.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.02, padArousal:-0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Set this action aside for the moment.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.02, padArousal:-0.03, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'Do not continue past this point.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.01, padArousal:-0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Avoid taking this step right now.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.02, padArousal:-0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Pause the process instead of advancing.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.02, padArousal:-0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Do not proceed further with this action.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.01, padArousal:-0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Stop here and reassess later.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.02, padArousal:-0.03, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'Refrain from taking the next step.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.01, padArousal:-0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Do not act on this at this time.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.01, padArousal:-0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Pause before any further action.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.02, padArousal:-0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Avoid continuing with this process.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.01, padArousal:-0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Stop and leave this unchanged for now.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.02, padArousal:-0.03, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'Do not advance until conditions change.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.01, padArousal:-0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Hold this position and do not continue.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.01, padArousal:-0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Avoid pushing forward here.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.02, padArousal:-0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Stop the action at this stage.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.01, padArousal:-0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Pause and do not proceed.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.02, padArousal:-0.03, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'Leave this step undone for now.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.02, padArousal:-0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Do not carry this action forward.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.01, padArousal:-0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Stop before moving ahead.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.02, padArousal:-0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Avoid continuing until further notice.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.01, padArousal:-0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Pause the action here.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.02, padArousal:-0.03, padDominance:-0.05 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.instruct (discourage_action) batch import...');
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
