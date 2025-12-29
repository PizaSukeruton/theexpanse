import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.build_rapport';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'I’d love to hear a bit more about that.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.07, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'If you’re comfortable, tell me more.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'That’s interesting—can you share more detail?', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.07, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I’m curious to hear more about your experience.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'If you want to expand on that, I’m listening.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'Can you tell me a bit more?', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.07, padArousal:0.02, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I’m interested—what else stands out for you?', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Feel free to go into more detail if you’d like.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'What was that like for you?', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.07, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I’m here—tell me more when you’re ready.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },

  { speakerCharacterId:'700002', utteranceText:'There’s no rush—share more if it helps.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.09, padArousal:0.01, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I’m genuinely interested in hearing more.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'If there’s more to say, I’m open to it.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'You can keep going—I’m following.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'What else feels important to mention?', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.07, padArousal:0.03, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'I’m listening—feel free to elaborate.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'That sounds meaningful—want to share more?', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.08, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'If you’d like, I’m happy to hear the rest.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'Go on—I’m here with you.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I’m interested in whatever you feel like adding.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'You don’t have to hold back—I’m listening.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'If there’s more context, I’d like to hear it.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.07, padArousal:0.02, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Take your time—share as much as you want.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.09, padArousal:0.01, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I’m here and interested—tell me more.', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Anything else you want to add?', dialogueFunctionCode:'partner_communication_management.encourage_more_detail', speechActCode:'expressive', padPleasure:0.07, padArousal:0.02, padDominance:-0.04 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM partner_communication_management.encourage_more_detail (expressive / build_rapport) batch import...');
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
          'ltlmbrief.partner_communication_management.encourage_more_detail',
          true,
          1,
          ['ltlm','partner_communication_management.encourage_more_detail'],
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
