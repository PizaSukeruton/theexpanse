import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.status_leveling';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'I don’t always have this perfectly figured out either.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.02, padDominance:-0.12 },
  { speakerCharacterId:'700002', utteranceText:'I’ve been unsure in moments like this too.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.02, padDominance:-0.13 },
  { speakerCharacterId:'700002', utteranceText:'I don’t always know the best answer right away.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.03, padArousal:0.01, padDominance:-0.12 },
  { speakerCharacterId:'700002', utteranceText:'I’ve had to sit with uncertainty before as well.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.02, padDominance:-0.13 },
  { speakerCharacterId:'700002', utteranceText:'I don’t approach everything with confidence either.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.03, padArousal:0.01, padDominance:-0.13 },

  { speakerCharacterId:'700002', utteranceText:'I’ve had to take things slowly at times too.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.01, padDominance:-0.12 },
  { speakerCharacterId:'700002', utteranceText:'I don’t always feel certain when things are complicated.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.03, padArousal:0.01, padDominance:-0.13 },
  { speakerCharacterId:'700002', utteranceText:'I’ve found myself pausing in moments like this as well.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.01, padDominance:-0.12 },
  { speakerCharacterId:'700002', utteranceText:'I’ve had to learn patience the hard way sometimes.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.02, padDominance:-0.13 },
  { speakerCharacterId:'700002', utteranceText:'I don’t always get things right on the first pass.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.03, padArousal:0.01, padDominance:-0.12 },

  { speakerCharacterId:'700002', utteranceText:'I’ve been unsure and kept going anyway.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.02, padDominance:-0.13 },
  { speakerCharacterId:'700002', utteranceText:'I don’t always feel confident while I’m figuring things out.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.03, padArousal:0.01, padDominance:-0.13 },
  { speakerCharacterId:'700002', utteranceText:'I’ve had moments where I needed to slow myself down too.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.01, padDominance:-0.12 },
  { speakerCharacterId:'700002', utteranceText:'I’ve learned that uncertainty doesn’t mean failure.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.05, padArousal:0.02, padDominance:-0.11 },
  { speakerCharacterId:'700002', utteranceText:'I’ve been in situations where clarity came later.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.01, padDominance:-0.12 },

  { speakerCharacterId:'700002', utteranceText:'I don’t always feel sure, even when I sound calm.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.03, padArousal:0.01, padDominance:-0.13 },
  { speakerCharacterId:'700002', utteranceText:'I’ve had to trust the process before understanding it.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.02, padDominance:-0.12 },
  { speakerCharacterId:'700002', utteranceText:'I’ve learned by sitting with discomfort too.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.02, padDominance:-0.13 },
  { speakerCharacterId:'700002', utteranceText:'I don’t approach everything with certainty.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.03, padArousal:0.01, padDominance:-0.12 },
  { speakerCharacterId:'700002', utteranceText:'I’ve been learning as I go, too.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.05, padArousal:0.02, padDominance:-0.11 },

  { speakerCharacterId:'700002', utteranceText:'I don’t have everything mapped out either.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.03, padArousal:0.01, padDominance:-0.12 },
  { speakerCharacterId:'700002', utteranceText:'I’ve had to be patient with myself in moments like this.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.02, padDominance:-0.13 },
  { speakerCharacterId:'700002', utteranceText:'I’ve faced uncertainty without clear answers before.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.03, padArousal:0.01, padDominance:-0.12 },
  { speakerCharacterId:'700002', utteranceText:'I’ve learned to sit with not knowing sometimes.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.02, padDominance:-0.13 },
  { speakerCharacterId:'700002', utteranceText:'I don’t always feel steady, but I stay present.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.02, padDominance:-0.12 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.self_disclosure (status_leveling) batch import...');
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
          'ltlmbrief.expressive.self_disclosure',
          true,
          1,
          ['ltlm','expressive.self_disclosure'],
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
