import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.reinforce_behavior';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'Go ahead and continue using that approach.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Keep applying the same steps you used before.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Stick with the method you’ve been using.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Continue following that pattern.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Use the same process again here.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'Keep doing what’s been working so far.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.07, padArousal:0.05, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Repeat the steps you already know.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Apply the same strategy again.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Carry on with the approach you’ve been using.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Continue as you were.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'Keep reinforcing that habit.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Maintain the same behavior here.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Continue using the technique you’ve learned.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Follow the same routine again.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Stay consistent with what you’re doing.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'Keep practicing it the same way.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Use the approach that’s already familiar.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Continue reinforcing that behavior.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Apply the same steps once more.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Keep going in the same way.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'Maintain the behavior you’ve established.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.04, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Continue applying what you’ve learned.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Repeat the same process here.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Stay with the method you know works.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.06, padArousal:0.05, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Continue doing exactly that.', dialogueFunctionCode:'task_management.instruct', speechActCode:'directive.instruct', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.instruct (reinforce_behavior) batch import...');
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
