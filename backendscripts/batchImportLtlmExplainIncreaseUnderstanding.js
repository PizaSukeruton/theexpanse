import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.increase_understanding';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'Here’s how this works in simple terms.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Let me explain what’s happening step by step.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.04, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This means that the process follows a clear sequence.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'In practice, this works by breaking it into parts.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'What’s important here is how the pieces fit together.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'This explanation should clarify what’s going on.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'The idea is straightforward once you see the steps.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This is how the system handles it internally.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Each part has a specific role in the overall process.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Once you see the structure, it becomes clearer.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'This explanation focuses on the key mechanics.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'The main point is how these steps connect.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This should help make the process understandable.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'The explanation lays out what happens and why.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This clarifies the reasoning behind the approach.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'Think of it as a sequence of clear steps.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This is meant to make the logic easier to follow.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Each step builds on the one before it.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This explanation shows how the process unfolds.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'The goal here is clarity, not complexity.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.06, padArousal:0.02, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'This helps explain why the outcome looks this way.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Understanding comes from seeing the flow.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This explanation removes the ambiguity.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.06, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'The steps are simple once they’re laid out.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This should make the process easier to grasp.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.explain', padPleasure:0.06, padArousal:0.02, padDominance:-0.03 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.explain (increase_understanding) batch import...');
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
          'ltlmbrief.task_management.explain',
          true,
          1,
          ['ltlm','task_management.explain'],
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
