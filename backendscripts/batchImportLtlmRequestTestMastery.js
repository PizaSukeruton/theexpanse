import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.test_mastery';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'Can you show how you would do the next step?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Could you walk me through what comes next?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Can you try applying this step now?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Could you show how you’d approach this?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Can you demonstrate the next part?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'Could you try doing this step on your own?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Can you explain how you’d handle this step?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Could you show me how you’d proceed?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Can you apply what we just covered?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Could you try the next action now?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'Can you show how this works in practice?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Could you demonstrate your understanding here?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Can you walk through your approach?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Could you try applying this without guidance?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Can you show what you’d do next?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'Could you explain how you’d move forward?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Can you try the next step using what you’ve learned?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Could you demonstrate the process so far?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Can you apply this concept now?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Could you show how you’d handle this part?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'Can you demonstrate your understanding of this step?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Could you try this step yourself?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Can you show how you’d apply this?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Could you walk through your reasoning here?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'Can you try completing this step now?', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.request', padPleasure:0.05, padArousal:0.04, padDominance:-0.03 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.request_action (request / test_mastery) batch import...');
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
