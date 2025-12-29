import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.increase_understanding';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'Can you tell me what you’re hoping to get out of this?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'What’s the main outcome you’re aiming for here?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Can you clarify what you want to achieve?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.03, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'What are you trying to accomplish with this question?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.03, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Can you explain what direction you want this to go?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'What’s your goal so I can tailor the response?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Can you share what you’re looking for specifically?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.03, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'What result would be most helpful for you?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Can you clarify your intent so I answer the right thing?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.03, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'What are you hoping I focus on?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'Can you tell me what prompted this question?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.03, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'What do you want to understand better by asking this?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Can you describe the problem you’re trying to solve?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.03, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'What’s the context you’re working from?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.03, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Can you clarify what success looks like for you here?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'What are you trying to decide or understand?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.03, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Can you explain what you need from me right now?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'What’s the main thing you want clarified?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.03, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Can you specify what kind of answer would help?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'What are you ultimately trying to figure out?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.03, padArousal:0.03, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'Can you clarify your objective so I stay aligned?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'What are you hoping this conversation helps you with?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Can you tell me what you want clarity on?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.03, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'What’s the question behind the question for you?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Can you clarify what you want to walk away understanding?', dialogueFunctionCode:'partner_communication_management.clarify_partner_intent', speechActCode:'directive.request', padPleasure:0.04, padArousal:0.02, padDominance:-0.02 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM partner_communication_management.clarify_partner_intent (directive.request / increase_understanding) batch import...');
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
