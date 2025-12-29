import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.maintain_presence';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'How are you feeling right now?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'How are things sitting with you at the moment?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'How does this feel for you right now?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.03, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'Where are you at with this right now?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.05, padArousal:0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'How are you doing with this so far?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.07 },

  { speakerCharacterId:'700002', utteranceText:'How does this land for you?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.05, padArousal:0.03, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'How are you feeling about this right now?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'What’s your state right now?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.05, padArousal:0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'How is this sitting with you?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.05, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'How are you holding up with this?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.03, padDominance:-0.07 },

  { speakerCharacterId:'700002', utteranceText:'How are you experiencing this moment?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.05, padArousal:0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'How does this feel in your body right now?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.05, padArousal:0.03, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'How are things feeling for you at this point?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'What’s your sense of this right now?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.05, padArousal:0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'How are you doing in this moment?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.08 },

  { speakerCharacterId:'700002', utteranceText:'How does this sit with you emotionally?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.05, padArousal:0.03, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'How are you feeling as we talk about this?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'How are things feeling right now for you?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'What’s your internal state at the moment?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.05, padArousal:0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'How is this moment feeling for you?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.08 },

  { speakerCharacterId:'700002', utteranceText:'How are you doing with everything right now?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.03, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'How does this feel to you right now?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.05, padArousal:0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'Where are you at emotionally with this?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.05, padArousal:0.03, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'How are things feeling inside right now?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'How are you doing with all of this?', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.07 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM partner_communication_management.confirm_partner_state (encourage / maintain_presence) batch import...');
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
          'ltlmbrief.partner_communication_management.confirm_partner_state',
          true,
          1,
          ['ltlm','partner_communication_management.confirm_partner_state'],
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
