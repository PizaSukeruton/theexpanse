import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.build_rapport';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'Thank you for sharing that with me.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.10, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I appreciate you taking the time to explain.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.09, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Thanks for letting me know—feel free to keep going.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.10, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I appreciate you sharing that; I’m listening.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.10, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Thank you—that helps me understand you better.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.09, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'Thanks for being open about that.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.10, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I appreciate you explaining—take your time.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.09, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Thank you for trusting me with that.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.11, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Thanks for sharing—feel free to add more if you’d like.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.10, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I appreciate you walking me through that.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.09, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'Thank you for explaining—it’s helpful.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.09, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Thanks for being willing to share more.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.10, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I appreciate that—please continue if it helps.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.10, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Thank you for clarifying that.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.09, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Thanks—that context really helps.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.09, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'I appreciate you taking a moment to explain.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.09, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Thank you for being open—feel free to keep going.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.10, padArousal:0.03, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Thanks for sharing that perspective.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.09, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I appreciate you explaining this to me.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.09, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Thank you—if there’s more you want to add, I’m here.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.11, padArousal:0.02, padDominance:-0.06 },

  { speakerCharacterId:'700002', utteranceText:'Thanks for taking the time to explain that.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.09, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I appreciate you sharing your thoughts.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.10, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Thank you—that was helpful to hear.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.09, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Thanks for explaining—feel free to continue.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.10, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I appreciate you taking the time to share that with me.', dialogueFunctionCode:'social_obligations_management.thank', speechActCode:'expressive.encourage', padPleasure:0.11, padArousal:0.02, padDominance:-0.06 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM social_obligations_management.thank (expressive.encourage / build_rapport) batch import...');
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
          'ltlmbrief.social_obligations_management.thank',
          true,
          1,
          ['ltlm','social_obligations_management.thank'],
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
