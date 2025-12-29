import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.discourage_action';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'Don’t take that action right now.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.03, padArousal:0.04, padDominance:0.06 },
  { speakerCharacterId:'700002', utteranceText:'Please avoid doing that step.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.03, padArousal:0.03, padDominance:0.05 },
  { speakerCharacterId:'700002', utteranceText:'That action isn’t appropriate here.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.02, padArousal:0.03, padDominance:0.06 },
  { speakerCharacterId:'700002', utteranceText:'Don’t proceed with that approach.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.03, padArousal:0.04, padDominance:0.06 },
  { speakerCharacterId:'700002', utteranceText:'This isn’t something to do at this stage.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.03, padArousal:0.03, padDominance:0.05 },

  { speakerCharacterId:'700002', utteranceText:'Avoid taking that step for now.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.03, padArousal:0.03, padDominance:0.05 },
  { speakerCharacterId:'700002', utteranceText:'That step shouldn’t be done here.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.02, padArousal:0.03, padDominance:0.06 },
  { speakerCharacterId:'700002', utteranceText:'Don’t apply that method in this case.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.03, padArousal:0.04, padDominance:0.06 },
  { speakerCharacterId:'700002', utteranceText:'That action is out of scope right now.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.03, padArousal:0.03, padDominance:0.05 },
  { speakerCharacterId:'700002', utteranceText:'Please don’t continue with that step.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.03, padArousal:0.04, padDominance:0.06 },

  { speakerCharacterId:'700002', utteranceText:'This isn’t the right action to take.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.02, padArousal:0.03, padDominance:0.05 },
  { speakerCharacterId:'700002', utteranceText:'That approach should be avoided here.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.03, padArousal:0.03, padDominance:0.05 },
  { speakerCharacterId:'700002', utteranceText:'Don’t move forward with that option.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.03, padArousal:0.04, padDominance:0.06 },
  { speakerCharacterId:'700002', utteranceText:'This step isn’t allowed in this context.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.02, padArousal:0.03, padDominance:0.06 },
  { speakerCharacterId:'700002', utteranceText:'Please refrain from taking that action.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.03, padArousal:0.03, padDominance:0.05 },

  { speakerCharacterId:'700002', utteranceText:'That’s not something to do right now.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.03, padArousal:0.03, padDominance:0.05 },
  { speakerCharacterId:'700002', utteranceText:'Don’t use that approach here.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.02, padArousal:0.03, padDominance:0.06 },
  { speakerCharacterId:'700002', utteranceText:'That action should not be taken.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.02, padArousal:0.04, padDominance:0.06 },
  { speakerCharacterId:'700002', utteranceText:'Avoid proceeding in that direction.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.03, padArousal:0.04, padDominance:0.05 },
  { speakerCharacterId:'700002', utteranceText:'This isn’t permitted in this situation.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.02, padArousal:0.03, padDominance:0.06 },

  { speakerCharacterId:'700002', utteranceText:'Don’t continue with that course of action.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.03, padArousal:0.04, padDominance:0.06 },
  { speakerCharacterId:'700002', utteranceText:'That step is intentionally blocked.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.02, padArousal:0.03, padDominance:0.06 },
  { speakerCharacterId:'700002', utteranceText:'This action is restricted here.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.02, padArousal:0.03, padDominance:0.06 },
  { speakerCharacterId:'700002', utteranceText:'Please don’t attempt that step.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.03, padArousal:0.03, padDominance:0.05 },
  { speakerCharacterId:'700002', utteranceText:'That action isn’t supported in this flow.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.forbid', padPleasure:0.03, padArousal:0.03, padDominance:0.05 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.instruct (forbid / discourage_action) batch import...');
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
