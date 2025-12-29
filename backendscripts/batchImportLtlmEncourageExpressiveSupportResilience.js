import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.support_resilience';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'You’ve made it through hard things before.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'You can keep going, even if it’s slow.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'It’s okay to take this one step at a time.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You’re still standing, and that counts.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You don’t have to give up on yourself here.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.07 },

  { speakerCharacterId:'700002', utteranceText:'You can take a breath and keep moving.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You’re allowed to keep trying.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Even small steps still matter.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'You don’t have to be perfect to keep going.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You can keep showing up for yourself.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.06 },

  { speakerCharacterId:'700002', utteranceText:'You’re allowed to continue at your own pace.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'This doesn’t undo the strength you’ve shown.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You’re still capable, even now.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'It’s okay to keep choosing yourself.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You can hold on a little longer.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.03, padDominance:-0.07 },

  { speakerCharacterId:'700002', utteranceText:'You’ve shown resilience already.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'You can keep moving forward in your own way.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'This moment doesn’t define everything.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You can keep going without rushing.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You don’t have to stop here.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.03, padDominance:-0.07 },

  { speakerCharacterId:'700002', utteranceText:'You’re allowed to persist, gently.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You can stay with this a little longer.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You’ve already shown you can endure.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'You’re still here — that matters.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You can keep choosing to continue.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.07 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.encourage (support_resilience) batch import...');
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
