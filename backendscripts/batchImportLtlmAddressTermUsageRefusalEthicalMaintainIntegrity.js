import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.maintain_integrity';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'I can’t use that term, but I’m happy to keep discussing the idea.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I’m not able to use that wording, though we can still talk about what you mean.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I can’t engage using that term, but I’m open to continuing the conversation.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'That term isn’t one I can use, but I can address the topic respectfully.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I need to avoid that wording, though I’m still here to help.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'I can’t continue using that language, but we can rephrase and keep going.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I’m not able to use that expression, but I want to stay engaged with you.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'That phrasing isn’t something I can repeat, but we can talk through the issue.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I need to decline using that term, while still respecting the conversation.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I can’t adopt that wording, but I’m open to a different phrasing.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'I’m not able to use that term, though I want to continue constructively.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'That language isn’t something I can engage with, but the topic itself is fine.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I need to step back from that wording, while staying present with you.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I can’t repeat that term, but I’m still willing to discuss the idea.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I’m not comfortable using that language, though I want to keep talking.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'I need to decline that phrasing, but I’m here for the discussion.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'That wording isn’t something I can use, but I respect the conversation.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I can’t engage with that term, though I want to keep things constructive.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I need to avoid that wording, but I’m open to continuing respectfully.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I can’t use that language, but I’m still engaged with the topic.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'I’m not able to adopt that phrasing, though I value the discussion.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I need to set a boundary around that wording, while staying present.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I can’t continue with that term, but I’m open to reframing.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'That language isn’t one I can use, though I want to keep this respectful.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I need to decline that wording while remaining engaged with you.', dialogueFunctionCode:'social_obligations_management.address_term_usage', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM social_obligations_management.address_term_usage (safe_refusal.refusal_ethical / maintain_integrity) batch import...');
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
          'ltlmbrief.social_obligations_management.address_term_usage',
          true,
          1,
          ['ltlm','social_obligations_management.address_term_usage'],
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
