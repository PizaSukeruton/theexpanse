import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.increase_autonomy';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'I can’t do that, but you’re free to choose another direction.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.05, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'That’s not something I can proceed with.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I’m not able to continue with that option.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'That isn’t something I can help with.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I can’t take that approach here.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.03, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'That option isn’t available to me.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I’m unable to move forward with that request.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'That isn’t within what I can do.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I can’t continue with that suggestion.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'That approach isn’t something I can take on.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'I’m not able to act on that.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'That’s outside what I can support.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I can’t assist with that option.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'That isn’t something I’m able to do.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I can’t proceed with that request.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.03, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'That’s not an action I can take.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I’m unable to help in that way.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'That option isn’t something I can act on.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I can’t move forward with that.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'That’s not something I can engage with.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'I’m not able to continue in that direction.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.05, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'That’s outside my scope to act on.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I can’t support that action.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'That request isn’t something I can fulfill.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I can’t go forward with that.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.refuse', padPleasure:0.04, padArousal:0.03, padDominance:-0.04 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.propose (refuse / increase_autonomy) batch import...');
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
