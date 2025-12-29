import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.encourage_action';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'Let’s go ahead and take the next step together.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.07, padArousal:0.05, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Let’s move forward with this approach.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.06, padArousal:0.05, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Let’s try this option and see how it goes.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.07, padArousal:0.05, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Let’s take action on this step now.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.06, padArousal:0.06, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Let’s proceed with this plan.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.06, padArousal:0.05, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'Let’s move ahead and do this.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.07, padArousal:0.05, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Let’s take the next action together.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.07, padArousal:0.05, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Let’s commit to trying this next.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.06, padArousal:0.05, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Let’s go forward with this option.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.06, padArousal:0.05, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Let’s act on this and continue.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.07, padArousal:0.05, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'Let’s move into the next step now.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.06, padArousal:0.05, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Let’s go ahead and do this part.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.06, padArousal:0.05, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Let’s take action and see what happens.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.07, padArousal:0.06, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Let’s proceed and work through this.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.06, padArousal:0.05, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Let’s move forward from here.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.07, padArousal:0.05, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'Let’s commit to the next step.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.06, padArousal:0.05, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Let’s take this forward together.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.07, padArousal:0.05, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Let’s act on this plan now.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.06, padArousal:0.06, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Let’s move ahead with confidence.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.07, padArousal:0.05, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Let’s proceed and take the action.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.06, padArousal:0.05, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'Let’s go forward and try this.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.07, padArousal:0.05, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Let’s take the step we’ve discussed.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.06, padArousal:0.05, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Let’s move ahead with the next action.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.06, padArousal:0.05, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Let’s act and continue from here.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.07, padArousal:0.05, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Let’s commit to moving forward.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.commit', padPleasure:0.07, padArousal:0.05, padDominance:-0.05 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.propose (commit / encourage_action) batch import...');
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
          'ltlmbrief.task_management.propose',
          true,
          1,
          ['ltlm','task_management.propose'],
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
