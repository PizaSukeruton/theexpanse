import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.model_behavior';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'Start by doing it this way, then adjust as needed.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Here’s one way to approach it step by step.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Try following this pattern as an example.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'You can model it after this approach.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Do it the way I’m showing here.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.05, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'Follow this example to get started.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Use this as a reference for how to proceed.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'This is a good example of how to do it.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Try copying this approach first.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.05, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Begin by following this example.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'Use this method as a guide.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'This shows one effective way to do it.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Follow along with this example.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.05, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'You can base your approach on this.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'This is how the process usually looks.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.03, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'Watch how this unfolds and mirror it.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.05, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This example demonstrates the behavior clearly.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'You can replicate this pattern.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.04, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Use this demonstration as your template.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'This gives you a model to follow.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'Start by imitating this approach.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.05, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This example illustrates the behavior well.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Follow this as a working example.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.05, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'You can learn from this example.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'This is a solid model to use.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.04 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.instruct (model_behavior) batch import...');
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
