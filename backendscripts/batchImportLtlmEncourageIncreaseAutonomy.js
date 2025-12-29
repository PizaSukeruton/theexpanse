import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.increase_autonomy';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'You get to choose what feels right here.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'This is ultimately your call to make.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'You can decide how you want to proceed.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'You’re free to take this in the direction that fits you.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'You don’t need permission to choose here.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },

  { speakerCharacterId:'700002', utteranceText:'You’re allowed to decide your next step.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'It’s okay to trust your own judgment.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'You’re in control of how this unfolds.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You can choose what matters most right now.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'This decision belongs to you.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.08 },

  { speakerCharacterId:'700002', utteranceText:'You don’t have to follow anyone else’s script here.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'You can shape this in your own way.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'You’re free to decide what comes next.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'You get to set the pace and direction.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'You can choose to engage with this however you want.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },

  { speakerCharacterId:'700002', utteranceText:'You’re not obligated to do this any particular way.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'You can follow what feels most aligned for you.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'You decide what’s useful to take from this.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'You can stop, continue, or change course as you see fit.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'This is yours to steer.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.08 },

  { speakerCharacterId:'700002', utteranceText:'You’re free to make the choice that suits you.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'You don’t owe anyone a particular decision here.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'You can decide what feels sustainable for you.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'You’re empowered to choose your own path here.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.04, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'You get to decide what happens next.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.08 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.encourage (increase_autonomy) batch import...');
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
