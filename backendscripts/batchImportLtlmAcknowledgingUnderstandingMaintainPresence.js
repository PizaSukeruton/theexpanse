import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.maintain_presence';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'I understand what you’re saying.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.06, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'That makes sense to me.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.06, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I’m following you.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.05, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I see what you mean.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.06, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Yes, I get that.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.05, padArousal:0.01, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'I understand your point.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.06, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I’m with you so far.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.05, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'That tracks for me.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.05, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I see how that fits.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.06, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I understand where you’re coming from.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.06, padArousal:0.01, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'Got it, that makes sense.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.05, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I’m tracking with you.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.05, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I follow what you’re saying.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.05, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Yes, I understand.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.05, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'That makes sense to me so far.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.06, padArousal:0.01, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'I’m following along.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.05, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I see the point you’re making.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.06, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I understand the idea.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.05, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Yes, that’s clear to me.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.06, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I see what you’re getting at.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.06, padArousal:0.01, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'I’m with you.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.05, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Yes, I understand what you mean.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.06, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'That’s clear.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.05, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I get it.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.05, padArousal:0.01, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Understood.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.05, padArousal:0.01, padDominance:-0.03 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM auto_feedback.acknowledging_understanding (expressive / maintain_presence) batch import...');
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
          'ltlmbrief.auto_feedback.acknowledging_understanding',
          true,
          1,
          ['ltlm','auto_feedback.acknowledging_understanding'],
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
