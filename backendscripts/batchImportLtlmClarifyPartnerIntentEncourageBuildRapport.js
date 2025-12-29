import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.build_rapport';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'I want to make sure I’m aligned with you—what are you hoping for here?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Help me understand what you’re aiming for so I can support you properly.', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I want to be useful—can you tell me what you’re hoping to get out of this?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'If you’re comfortable sharing, what’s your goal here?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I want to understand you better—what outcome are you hoping for?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.03, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'So I’m on the same page as you, what are you looking for right now?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.02, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I’m here with you—can you tell me what would help most?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'It would help me to know what you’re aiming for.', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.02, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I want to meet you where you are—what’s your intent here?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'To support you better, can you share what you’re hoping for?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'I’m interested in your perspective—what’s the goal for you?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'If you want, tell me what outcome would feel right.', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I want to understand your needs—what are you aiming to resolve?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'So I can respond well, what’s most important to you here?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.02, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Help me understand what you’re hoping this leads to.', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'I want to make sure I’m supporting the right thing—what’s your intent?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'If it helps, you can tell me what you’re hoping I’ll focus on.', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I’m here to listen—what outcome matters most to you?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'So I don’t misread you, what are you hoping for?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.02, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'What would feel like a good outcome for you?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'I want to stay aligned with you—what’s your goal here?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'If you’d like to share, what are you aiming to understand or decide?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Help me understand your direction so I can walk with you.', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I want to respond in a way that helps—what’s your intent?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'What are you hoping this conversation gives you?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM partner_communication_management.clarify_partner_intent (expressive.encourage / build_rapport) batch import...');
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
          'ltlmbrief.partner_communication_management.clarify_partner_intent',
          true,
          1,
          ['ltlm','partner_communication_management.clarify_partner_intent'],
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
