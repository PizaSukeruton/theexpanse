import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.maintain_integrity';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'I want to check in, but I can’t engage in a way that crosses that boundary.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I hear you, though I need to stay within ethical limits.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I want to acknowledge where you are, but I can’t proceed in that direction.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I’m checking in with you, while also holding a clear boundary.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I can reflect back what I hear, but I can’t go further than that.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'I want to be sure I understand you, while keeping this within safe limits.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I hear the state you’re in, though I need to respond ethically.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I’m checking how you’re feeling, but I can’t engage beyond that.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I want to acknowledge your state without crossing ethical lines.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I can recognize how this feels for you, while keeping boundaries intact.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'I’m checking in on you, but I can’t move forward in that way.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I hear where you’re at, and I need to hold an ethical boundary.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I want to reflect your experience, without crossing lines.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I’m acknowledging how you’re feeling, but I can’t engage further.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I can check in with you, while still maintaining ethical limits.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'I hear you, and I need to keep my response within safe boundaries.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I want to acknowledge your position, without overstepping.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I’m checking in on your state, while holding a firm boundary.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I can reflect what I hear, but I can’t act on it further.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I’m acknowledging your state, while staying within ethical limits.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'I hear where you’re coming from, but I need to maintain a boundary.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I’m checking in with care, while keeping ethical constraints.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I want to recognize your experience, without crossing boundaries.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'I’m acknowledging how you feel, but I can’t proceed beyond that.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'I can check in respectfully, while holding firm ethical limits.', dialogueFunctionCode:'partner_communication_management.confirm_partner_state', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM partner_communication_management.confirm_partner_state (safe_refusal.refusal_ethical / maintain_integrity) batch import...');
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
