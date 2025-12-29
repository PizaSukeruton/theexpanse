import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.increase_autonomy';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'You can start with whichever step feels easiest.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.03, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'Choose one part to focus on first.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.03, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'Pick the option that feels most workable right now.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.04, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'Decide which part you want to tackle first.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'You can approach this in the order that suits you.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },

  { speakerCharacterId:'700002', utteranceText:'Select the step that feels most manageable.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.03, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'You’re free to choose how to begin.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.02, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Decide which approach works best for you.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.04, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'Choose the path that feels right to start with.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'You can decide the order that makes sense to you.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.03, padDominance:-0.09 },

  { speakerCharacterId:'700002', utteranceText:'Pick whichever step feels most accessible.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'Choose a starting point that feels comfortable.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Decide how you want to begin.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.03, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'You can structure this in a way that works for you.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Select the option that feels most appropriate.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.09 },

  { speakerCharacterId:'700002', utteranceText:'You can choose where to focus your effort.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Decide which part to work on first.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'Pick a starting point that feels right.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Choose the step you feel ready to take.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'You can decide how to approach this.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.02, padDominance:-0.10 },

  { speakerCharacterId:'700002', utteranceText:'Select the approach that feels most natural.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Decide which option you want to pursue.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'Choose how you’d like to proceed.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Pick the way forward that fits you best.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'You can decide which direction to take.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.02, padDominance:-0.11 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.instruct (option_based_autonomy) batch import...');
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
