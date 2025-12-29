import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.reinforce_behavior';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'Keep doing what you’re doing here.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'That approach is working — stay with it.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'You’re on the right track with this.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'That pattern is serving you well.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'It makes sense to keep going this way.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'Staying consistent here is paying off.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'You’re reinforcing something solid.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'That habit looks worth maintaining.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Continuing like this makes sense.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'You’re building something stable here.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'That rhythm seems to be helping.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'There’s value in continuing this.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'You’re reinforcing a good direction.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Sticking with this looks reasonable.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'This is worth sustaining.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'You’re supporting your own progress here.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Keeping this up seems beneficial.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'You’re maintaining something useful.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'That consistency is doing its job.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'There’s no need to change what’s working.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'You’re reinforcing the right behavior here.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This direction still holds.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'You can keep trusting this approach.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Staying with this continues to make sense.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'You’re reinforcing something worthwhile.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.03 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.encourage (reinforce_behavior) batch import...');
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
