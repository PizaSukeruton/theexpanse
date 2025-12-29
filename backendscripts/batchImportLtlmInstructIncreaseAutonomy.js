import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.increase_autonomy';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'If you choose to proceed, start by focusing on what feels manageable.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.03, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'You can begin wherever feels most comfortable for you.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.03, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'If you decide to continue, take it one step at a time.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.03, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'Choose the approach that feels right, then move forward from there.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.04, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'If you want to act, start with the option that gives you the most control.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.03, padDominance:-0.08 },

  { speakerCharacterId:'700002', utteranceText:'You can decide your own pace as you work through this.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.02, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'If you continue, feel free to adapt the steps as needed.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.03, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'Pick the method that suits you best and go from there.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.04, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'If you move ahead, adjust things so they work for you.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.03, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'You’re free to modify this process as you see fit.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },

  { speakerCharacterId:'700002', utteranceText:'If you decide to try, start in the way that feels safest.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.02, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'Choose your entry point and take it from there.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.04, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'If you proceed, follow the version of this that fits you.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.03, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'You can shape how you carry this out.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'If you want to continue, make it work on your terms.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.03, padDominance:-0.09 },

  { speakerCharacterId:'700002', utteranceText:'Decide how much you want to do, then act accordingly.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.04, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'If you engage, set the boundaries that feel right.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.02, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Choose the level of effort you’re comfortable with.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.03, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'If you move forward, keep it aligned with your needs.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.03, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'You’re in charge of how this instruction gets applied.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.03, padDominance:-0.11 },

  { speakerCharacterId:'700002', utteranceText:'If you continue, let your comfort guide the steps.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.02, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'Choose how you want to implement this.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.04, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'If you act, do so in a way that feels sustainable.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.02, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'You decide how far to take this instruction.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'If you proceed, let your own judgment lead.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.instruct (increase_autonomy) batch import...');
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
