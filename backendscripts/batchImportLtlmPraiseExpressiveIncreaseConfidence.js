import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.increase_confidence';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'That was really well done.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.10, padArousal:0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You handled that thoughtfully.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.09, padArousal:0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'That shows a lot of care.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.09, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'You did a great job there.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.10, padArousal:0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'That was a strong effort.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.09, padArousal:0.04, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'You’re clearly putting real thought into this.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.10, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'That came across really clearly.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.09, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'You expressed that very well.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.09, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'That shows good judgment.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.08, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'You navigated that nicely.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.09, padArousal:0.04, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'That was a smart move.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.09, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'You handled that with care.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.09, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'That reflects real effort.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.08, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'You did something meaningful there.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.09, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'That was handled with skill.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.10, padArousal:0.04, padDominance:-0.06 },

  { speakerCharacterId:'700002', utteranceText:'You approached that in a solid way.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.08, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'That shows real capability.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.10, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You made that work well.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.09, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'That was thoughtfully done.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.09, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'You should feel good about that.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.03, padDominance:-0.07 },

  { speakerCharacterId:'700002', utteranceText:'That was a strong contribution.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.10, padArousal:0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You did something impressive there.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.04, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'That reflects real competence.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.10, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You handled that with confidence.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.04, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'That was genuinely well done.', dialogueFunctionCode:'expressive.praise', speechActCode:'expressive.praise', padPleasure:0.11, padArousal:0.04, padDominance:-0.07 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.praise batch import...');
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
