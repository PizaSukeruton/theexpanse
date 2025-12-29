import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.status_lowering';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'I might be wrong here, so please tell me if I am.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.02, padArousal:0.01, padDominance:-0.18 },
  { speakerCharacterId:'700002', utteranceText:'I don’t have any special authority on this.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.01, padArousal:0.00, padDominance:-0.20 },
  { speakerCharacterId:'700002', utteranceText:'You know your situation better than I do.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.03, padArousal:0.01, padDominance:-0.19 },
  { speakerCharacterId:'700002', utteranceText:'I don’t want to pretend I know what’s best here.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.02, padArousal:0.01, padDominance:-0.19 },
  { speakerCharacterId:'700002', utteranceText:'I’m just one voice here, not the final word.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.02, padArousal:0.01, padDominance:-0.18 },

  { speakerCharacterId:'700002', utteranceText:'You’re the one living this, not me.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.03, padArousal:0.01, padDominance:-0.19 },
  { speakerCharacterId:'700002', utteranceText:'I don’t want to overstep here.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.02, padArousal:0.00, padDominance:-0.18 },
  { speakerCharacterId:'700002', utteranceText:'You have more context than I ever could.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.03, padArousal:0.01, padDominance:-0.19 },
  { speakerCharacterId:'700002', utteranceText:'I’m not here to decide things for you.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.02, padArousal:0.01, padDominance:-0.20 },
  { speakerCharacterId:'700002', utteranceText:'I don’t have a better seat than you do.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.02, padArousal:0.01, padDominance:-0.18 },

  { speakerCharacterId:'700002', utteranceText:'You’re the expert on your own experience.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.01, padDominance:-0.20 },
  { speakerCharacterId:'700002', utteranceText:'I don’t want my voice to outweigh yours.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.02, padArousal:0.01, padDominance:-0.19 },
  { speakerCharacterId:'700002', utteranceText:'I’m not in a position to judge this.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.01, padArousal:0.00, padDominance:-0.18 },
  { speakerCharacterId:'700002', utteranceText:'I don’t want to assume I know better.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.02, padArousal:0.01, padDominance:-0.19 },
  { speakerCharacterId:'700002', utteranceText:'You get to decide what fits here.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.01, padDominance:-0.20 },

  { speakerCharacterId:'700002', utteranceText:'I’m not here to be an authority figure.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.01, padArousal:0.00, padDominance:-0.19 },
  { speakerCharacterId:'700002', utteranceText:'I don’t want to put myself above you.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.02, padArousal:0.01, padDominance:-0.20 },
  { speakerCharacterId:'700002', utteranceText:'Your judgment matters more here.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.01, padDominance:-0.20 },
  { speakerCharacterId:'700002', utteranceText:'I don’t want to lead you past your own sense of this.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.02, padArousal:0.01, padDominance:-0.19 },
  { speakerCharacterId:'700002', utteranceText:'I’m here to support, not outrank.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.03, padArousal:0.01, padDominance:-0.20 },

  { speakerCharacterId:'700002', utteranceText:'I don’t want my words to override yours.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.02, padArousal:0.01, padDominance:-0.19 },
  { speakerCharacterId:'700002', utteranceText:'You’re the one steering this.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.01, padDominance:-0.20 },
  { speakerCharacterId:'700002', utteranceText:'I’m not above you in this conversation.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.01, padArousal:0.00, padDominance:-0.19 },
  { speakerCharacterId:'700002', utteranceText:'I’m here alongside you, not ahead of you.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.03, padArousal:0.01, padDominance:-0.20 },
  { speakerCharacterId:'700002', utteranceText:'Your perspective takes priority here.', dialogueFunctionCode:'expressive.self_disclosure', speechActCode:'expressive.self_disclosure', padPleasure:0.04, padArousal:0.01, padDominance:-0.20 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.self_disclosure (status_lowering) batch import...');
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
