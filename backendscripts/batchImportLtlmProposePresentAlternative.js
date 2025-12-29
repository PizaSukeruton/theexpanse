import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.present_alternative';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'You could try a different approach here.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Another option might work better.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'It may help to consider an alternative way of doing this.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You could approach this from a different angle.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.06, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'There’s another way you might try.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },

  { speakerCharacterId:'700002', utteranceText:'You might want to explore a different option.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Another path could be worth considering.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'It could be useful to try something else.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You might consider a different strategy.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.06, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Another approach may feel easier.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },

  { speakerCharacterId:'700002', utteranceText:'You could switch to a different method.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Trying an alternative might help here.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You may want to rethink the approach slightly.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'Another option could be to handle it differently.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You could experiment with a different solution.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.06, padArousal:0.04, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'A different route might be more effective.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You could try adjusting your approach.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.06, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'It might help to choose another option.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You might switch strategies and see how that feels.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.06, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'There’s also the option of doing this another way.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },

  { speakerCharacterId:'700002', utteranceText:'You could consider an alternative solution.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Another method might suit you better.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.06, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'It’s possible to approach this differently.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You may want to try another option instead.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'A different approach could be worth trying.', dialogueFunctionCode:'task_management.propose', speechActCode:'directive.suggest', padPleasure:0.06, padArousal:0.04, padDominance:-0.05 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.propose (present_alternative) batch import...');
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
