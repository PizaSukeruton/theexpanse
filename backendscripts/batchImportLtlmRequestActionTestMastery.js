import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.test_mastery';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'Could you show me how you’d approach this?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Can you walk me through your thinking here?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Would you like to explain how you’d handle this?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Can you outline the steps you’d take?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Could you describe what you think happens next?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'Can you show how you’d apply this?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Would you mind demonstrating your approach?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Can you try explaining this in your own words?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Could you map out how you understand this?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Can you show me your reasoning here?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'Would you like to test your understanding out loud?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Can you talk through how this fits together?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Could you explain what this means in practice?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Can you describe how you’d use this?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Would you try laying out your understanding?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'Can you explain what you think is going on?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Could you walk me through your interpretation?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Can you show how you’d solve this?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Would you mind explaining your process?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Can you outline your understanding so far?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'Could you show me how you think about this?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Can you describe your current understanding?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Would you like to explain how you see this working?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Can you try applying this out loud?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Could you show how you’d put this into practice?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.request_action (test_mastery) batch import...');
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
          'ltlmbrief.task_management.request_action',
          true,
          1,
          ['ltlm','task_management.request_action'],
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
