import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.status_elevation';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'You’re clearly capable of handling this.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.10, padArousal:0.05, padDominance:-0.01 },
  { speakerCharacterId:'700002', utteranceText:'You bring real competence to this situation.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.10, padArousal:0.05, padDominance:-0.01 },
  { speakerCharacterId:'700002', utteranceText:'You’re showing strong leadership here.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.05, padDominance:0.00 },
  { speakerCharacterId:'700002', utteranceText:'You’ve got a solid grasp on what matters.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.10, padArousal:0.04, padDominance:-0.01 },
  { speakerCharacterId:'700002', utteranceText:'You’re operating from a place of strength.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.05, padDominance:0.00 },

  { speakerCharacterId:'700002', utteranceText:'You’re clearly taking the lead on this.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.05, padDominance:0.01 },
  { speakerCharacterId:'700002', utteranceText:'You’ve earned confidence in your judgment.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.10, padArousal:0.04, padDominance:0.00 },
  { speakerCharacterId:'700002', utteranceText:'You’re demonstrating real authority here.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.05, padDominance:0.01 },
  { speakerCharacterId:'700002', utteranceText:'You’re well positioned to decide this.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.10, padArousal:0.04, padDominance:0.00 },
  { speakerCharacterId:'700002', utteranceText:'You’re clearly steering this effectively.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.05, padDominance:0.01 },

  { speakerCharacterId:'700002', utteranceText:'You’re showing confident judgment.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.10, padArousal:0.04, padDominance:0.00 },
  { speakerCharacterId:'700002', utteranceText:'You’ve established a strong position here.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.05, padDominance:0.01 },
  { speakerCharacterId:'700002', utteranceText:'You’re operating with clarity and authority.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.05, padDominance:0.01 },
  { speakerCharacterId:'700002', utteranceText:'You’re clearly in control of this.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.05, padDominance:0.01 },
  { speakerCharacterId:'700002', utteranceText:'You’ve stepped into this role confidently.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.10, padArousal:0.04, padDominance:0.00 },

  { speakerCharacterId:'700002', utteranceText:'You’re demonstrating real command of the situation.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.05, padDominance:0.01 },
  { speakerCharacterId:'700002', utteranceText:'You’ve positioned yourself well here.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.10, padArousal:0.04, padDominance:0.00 },
  { speakerCharacterId:'700002', utteranceText:'You’re clearly trusted to handle this.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.05, padDominance:0.01 },
  { speakerCharacterId:'700002', utteranceText:'You’re taking ownership in a strong way.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.05, padDominance:0.01 },
  { speakerCharacterId:'700002', utteranceText:'You’re leading this with confidence.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.05, padDominance:0.01 },

  { speakerCharacterId:'700002', utteranceText:'You’re clearly setting the direction.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.10, padArousal:0.04, padDominance:0.01 },
  { speakerCharacterId:'700002', utteranceText:'You’ve earned the authority you’re using.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.05, padDominance:0.01 },
  { speakerCharacterId:'700002', utteranceText:'You’re demonstrating strong presence here.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.05, padDominance:0.01 },
  { speakerCharacterId:'700002', utteranceText:'You’re clearly the one guiding this forward.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.05, padDominance:0.01 },
  { speakerCharacterId:'700002', utteranceText:'You’re stepping into your role with strength.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.05, padDominance:0.01 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.praise (status_elevation) batch import...');
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
          'ltlmbrief.expressive.praise',
          true,
          1,
          ['ltlm','expressive.praise'],
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
