import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.reframe_perspective';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'That reaction makes sense given what you’re dealing with—there’s another way to look at it too.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I can see why that feels frustrating, and it might help to view it from a different angle.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Given your situation, that response is understandable—there’s also another perspective worth considering.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'It makes sense that you’d feel that way; sometimes shifting the frame changes how it lands.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I hear why this feels heavy—looking at it differently might ease some of that weight.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.06 },

  { speakerCharacterId:'700002', utteranceText:'That response fits the pressure you’re under, and there’s another interpretation that may help.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'It’s reasonable to see it that way, though a different lens might reveal something else.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I understand why this feels discouraging—there may be a more forgiving way to frame it.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'That reaction is human, and sometimes a small shift in perspective changes everything.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I can see how you arrived there—looking at it another way might open options.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.02, padDominance:-0.07 },

  { speakerCharacterId:'700002', utteranceText:'Your reaction lines up with the context, and there’s another angle that could be useful.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'That makes sense emotionally, and reframing it might soften the impact.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I get why this feels stuck—sometimes changing the frame unlocks movement.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Given what you’re facing, that view makes sense; another perspective may be kinder.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I understand why it looks that way—considering a different angle could help.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.02, padDominance:-0.07 },

  { speakerCharacterId:'700002', utteranceText:'That response fits the moment, and reframing it might reduce the strain.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I can see the logic in your reaction—another frame could reveal new meaning.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'That feeling is valid, and sometimes a perspective shift brings relief.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'It’s understandable you’d see it this way—another lens may change the takeaway.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I hear where you’re coming from, and reframing this could open space.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.06 },

  { speakerCharacterId:'700002', utteranceText:'That reaction fits the pressure you’re under—another perspective might ease it.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I understand why this feels difficult; looking at it differently may help.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'That’s a reasonable reaction, and a small reframing could shift how it lands.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I can see why this feels tense—sometimes perspective changes reduce that tension.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'That response is understandable, and reframing it might reveal a different path.', dialogueFunctionCode:'expressive.empathize', speechActCode:'expressive', padPleasure:0.07, padArousal:0.02, padDominance:-0.07 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.empathize (expressive / reframe_perspective) batch import...');
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
