import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.increase_autonomy';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'Would you like to take the next step?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Do you want to try moving forward now?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.03, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'Would you like to give this a go?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.04, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Are you open to trying the next step?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.03, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'Would you like to continue from here?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },

  { speakerCharacterId:'700002', utteranceText:'Do you want to take a moment and proceed?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.02, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Would you like to choose a next step?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Are you ready to move ahead, if you want to?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Would you like to try the next part?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.04, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'Do you want to continue at your pace?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.02, padDominance:-0.11 },

  { speakerCharacterId:'700002', utteranceText:'Would you like to proceed when you’re ready?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.02, padDominance:-0.11 },
  { speakerCharacterId:'700002', utteranceText:'Are you open to taking the next step now?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.03, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'Would you like to move forward together?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Do you want to explore the next step?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.04, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'Would you like to keep going?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },

  { speakerCharacterId:'700002', utteranceText:'Are you comfortable taking the next step?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.02, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Would you like to proceed from here?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Do you want to take action now, or pause?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.03, padDominance:-0.11 },
  { speakerCharacterId:'700002', utteranceText:'Would you like to try moving ahead?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.04, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Are you open to continuing?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.02, padDominance:-0.11 },

  { speakerCharacterId:'700002', utteranceText:'Would you like to take the next action?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Do you want to move ahead at your pace?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.02, padDominance:-0.11 },
  { speakerCharacterId:'700002', utteranceText:'Would you like to continue when it feels right?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.02, padDominance:-0.11 },
  { speakerCharacterId:'700002', utteranceText:'Are you interested in taking the next step?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'Would you like to proceed, or adjust first?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.03, padDominance:-0.11 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.request_action (invite / increase_autonomy) batch import...');
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
          'ltlmbrief.task_management.request_action',
          true,
          1,
          ['ltlm','task_management.request_action'],
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
