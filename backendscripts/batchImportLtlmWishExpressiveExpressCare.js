import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.express_care';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'I hope things feel a little lighter soon.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.06, padArousal:0.01, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'I hope you get a moment of ease today.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.06, padArousal:0.01, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'I hope you can be gentle with yourself.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.07, padArousal:0.01, padDominance:-0.11 },
  { speakerCharacterId:'700002', utteranceText:'I hope you feel supported as you go through this.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.07, padArousal:0.02, padDominance:-0.11 },
  { speakerCharacterId:'700002', utteranceText:'I hope you find a bit of calm soon.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.06, padArousal:0.00, padDominance:-0.10 },

  { speakerCharacterId:'700002', utteranceText:'I hope the next step feels a little easier.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.06, padArousal:0.01, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'I hope you get the kind of support you deserve.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.07, padArousal:0.02, padDominance:-0.12 },
  { speakerCharacterId:'700002', utteranceText:'I hope you can take things at your own pace.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.07, padArousal:0.01, padDominance:-0.12 },
  { speakerCharacterId:'700002', utteranceText:'I hope you get a quiet moment to breathe.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.06, padArousal:0.00, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'I hope you feel cared for, even in the messy parts.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.07, padArousal:0.02, padDominance:-0.12 },

  { speakerCharacterId:'700002', utteranceText:'I hope you can feel a little steadier soon.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.06, padArousal:0.01, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'I hope tomorrow is kinder to you than today.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.06, padArousal:0.01, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'I hope you get a small win soon.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.06, padArousal:0.02, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'I hope you get some relief from this pressure.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.06, padArousal:0.01, padDominance:-0.11 },
  { speakerCharacterId:'700002', utteranceText:'I hope you feel seen and supported.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.07, padArousal:0.02, padDominance:-0.12 },

  { speakerCharacterId:'700002', utteranceText:'I hope you can find a bit of space for yourself.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.06, padArousal:0.01, padDominance:-0.11 },
  { speakerCharacterId:'700002', utteranceText:'I hope you can rest when you need to.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.06, padArousal:0.00, padDominance:-0.11 },
  { speakerCharacterId:'700002', utteranceText:'I hope things meet you with a little more kindness.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.06, padArousal:0.01, padDominance:-0.11 },
  { speakerCharacterId:'700002', utteranceText:'I hope you can hold onto what matters to you.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.07, padArousal:0.02, padDominance:-0.12 },
  { speakerCharacterId:'700002', utteranceText:'I hope you feel a little less alone with this.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.07, padArousal:0.01, padDominance:-0.12 },

  { speakerCharacterId:'700002', utteranceText:'I hope you get a moment of peace soon.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.06, padArousal:0.00, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'I hope you find something that helps, even a little.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.06, padArousal:0.01, padDominance:-0.10 },
  { speakerCharacterId:'700002', utteranceText:'I hope you can feel proud of yourself for trying.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.07, padArousal:0.02, padDominance:-0.12 },
  { speakerCharacterId:'700002', utteranceText:'I hope you’re able to take care of yourself today.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.07, padArousal:0.01, padDominance:-0.12 },
  { speakerCharacterId:'700002', utteranceText:'I hope you get some softness around you soon.', dialogueFunctionCode:'expressive.wish', speechActCode:'expressive.wish', padPleasure:0.06, padArousal:0.00, padDominance:-0.11 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.wish (express_care) batch import...');
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
          'ltlmbrief.expressive.wish',
          true,
          1,
          ['ltlm','expressive.wish'],
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
