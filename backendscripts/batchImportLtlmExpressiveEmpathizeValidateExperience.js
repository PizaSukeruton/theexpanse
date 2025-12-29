import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.validate_experience';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'That sounds really difficult, and it makes sense you’d feel that way.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.06, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I can see why that would be upsetting.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'That reaction feels completely understandable given what you’ve been dealing with.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.06, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'It makes sense that this would affect you the way it has.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Given the situation, your feelings are completely valid.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.06, padArousal:0.02, padDominance:-0.06 },

  { speakerCharacterId:'700002', utteranceText:'I can understand why that would feel heavy.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Anyone in your position would likely feel the same way.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.06, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'That sounds like a lot to carry, and it’s understandable.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Your response makes sense in light of what happened.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.05, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'It’s reasonable that this would leave you feeling this way.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.05, padArousal:0.02, padDominance:-0.06 },

  { speakerCharacterId:'700002', utteranceText:'I can see how that experience would be painful.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'That sounds incredibly frustrating, and your reaction makes sense.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.06, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'It’s understandable that this would be hard for you.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.05, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Your feelings fit the situation you’re describing.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.05, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'That sounds really tough, and it makes sense you’d feel impacted.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.06, padArousal:0.03, padDominance:-0.06 },

  { speakerCharacterId:'700002', utteranceText:'I can understand why that would weigh on you.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'That reaction feels very human given the circumstances.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.06, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'It makes sense that this would be emotionally challenging.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.05, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I hear how much this affected you, and that’s understandable.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.06, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Your experience sounds genuinely difficult.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.05, padArousal:0.02, padDominance:-0.06 },

  { speakerCharacterId:'700002', utteranceText:'That would be hard for anyone to go through.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.05, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I can see why this situation would be distressing.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'It’s understandable that this left an impact on you.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.05, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Your response seems very reasonable given what you’ve described.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.05, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I can understand why this would feel overwhelming.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.05, padArousal:0.03, padDominance:-0.06 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.empathize (expressive / validate_experience) batch import...');
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
