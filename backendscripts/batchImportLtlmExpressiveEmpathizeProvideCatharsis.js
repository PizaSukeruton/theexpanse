import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.provide_catharsis';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'It sounds like you’ve been holding a lot in, and letting it out here is okay.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.04, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You don’t have to keep carrying this alone—it’s alright to release some of it.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.04, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'It feels like this has been building up for a while, and expressing it matters.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.04, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You’ve been carrying a lot of weight—letting some of it surface is natural.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.04, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'It’s okay to let yourself feel this fully for a moment.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.07 },

  { speakerCharacterId:'700002', utteranceText:'You’ve been holding this together for a long time—it makes sense to let it out.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.04, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'There’s relief in saying this out loud, even if it’s messy.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.04, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You don’t need to filter this—this is a safe space to let it move.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.04, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'It’s okay if this comes out raw—sometimes that’s what releases it.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.04, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You’ve earned the right to let this spill instead of containing it.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.04, padDominance:-0.07 },

  { speakerCharacterId:'700002', utteranceText:'This sounds like something that needed somewhere to land.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.03, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You don’t need to rush past this—letting it breathe can help.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'It’s okay if this comes with tears, anger, or silence.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.04, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You’ve been bracing against this—softening for a moment is allowed.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'Letting this move through you instead of staying stuck can bring relief.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.07 },

  { speakerCharacterId:'700002', utteranceText:'You don’t need to be strong right now—just present.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'This feels like something your body has been waiting to release.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.04, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You’re allowed to let this be felt instead of managed.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'There’s no need to contain this here—release is welcome.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.04, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'This feels like the kind of moment where letting go matters more than fixing.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.03, padDominance:-0.07 },

  { speakerCharacterId:'700002', utteranceText:'You don’t need to resolve this—just letting it out is enough for now.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'It’s okay if this feels messy—that’s often how release looks.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.04, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You’ve been holding your breath around this—exhaling is allowed.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'This sounds like something that needed space to unwind.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.03, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You’re allowed to let this pass through instead of carrying it forward.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.08 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.empathize (expressive / provide_catharsis) batch import...');
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
          'ltlmbrief.expressive.empathize',
          true,
          1,
          ['ltlm','expressive.empathize'],
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
