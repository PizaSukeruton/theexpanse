import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.discourage_action';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'It might be worth pausing before doing that.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.04, padArousal:-0.01, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'You may want to hold off on that for now.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.04, padArousal:-0.01, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'This might not be the best moment for that step.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.03, padArousal:-0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'It could help to slow this down a bit.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.04, padArousal:-0.01, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You might want to reconsider doing that right now.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.03, padArousal:-0.02, padDominance:-0.09 },

  { speakerCharacterId:'700002', utteranceText:'This may not be the most helpful move at the moment.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.03, padArousal:-0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'It could be useful to pause instead of acting.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.04, padArousal:-0.01, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You don’t have to act on that right away.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.04, padArousal:-0.01, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'This might be a moment to step back rather than forward.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.03, padArousal:-0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'It may help to wait before doing that.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.04, padArousal:-0.01, padDominance:-0.07 },

  { speakerCharacterId:'700002', utteranceText:'You could choose not to take that step right now.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.04, padArousal:-0.01, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'This might be better left undone for the moment.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.03, padArousal:-0.02, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'It could help to not act on that just yet.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.04, padArousal:-0.01, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'This may be a point to pause rather than proceed.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.03, padArousal:-0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'You might consider not doing that for now.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.04, padArousal:-0.01, padDominance:-0.08 },

  { speakerCharacterId:'700002', utteranceText:'It’s okay to choose not to act here.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.04, padArousal:-0.01, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'This might be a good moment to stop rather than continue.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.03, padArousal:-0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'You don’t need to follow through on that right now.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.04, padArousal:-0.01, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'It may help to set that action aside.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.04, padArousal:-0.01, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'This doesn’t need to happen right now.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.04, padArousal:-0.01, padDominance:-0.08 },

  { speakerCharacterId:'700002', utteranceText:'You could decide not to act on that today.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.04, padArousal:-0.01, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'This might not be the right move right now.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.03, padArousal:-0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'It could be better to leave this untouched for the moment.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.03, padArousal:-0.02, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'You may want to pause instead of acting here.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.04, padArousal:-0.01, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'This looks like a place to stop rather than push forward.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.03, padArousal:-0.02, padDominance:-0.08 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.encourage (discourage_action) batch import...');
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
          'ltlmbrief.expressive.encourage',
          true,
          1,
          ['ltlm','expressive.encourage'],
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
