import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'This explains what it is, not what it might seem like.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This is meant to clarify what applies and what does not.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This focuses on what matters, not the surrounding noise.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This is about how it works, not why it exists.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.04, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This clarifies the boundary between the two ideas.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'This shows what’s included and what’s excluded.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This explains the difference without comparing options.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.04, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This is what it does, rather than what it replaces.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This outlines the scope, not the alternatives.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.04, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This clears up what falls outside the definition.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'This addresses what applies here versus what does not.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This explains the limits of the concept.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This clarifies what’s relevant and what isn’t.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This defines the idea by ruling out misunderstandings.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This helps distinguish the core from the assumptions.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'This is about the actual behavior, not the label.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This clarifies what’s intended versus what’s assumed.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This shows the distinction without evaluating either side.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.04, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This separates the mechanism from the outcome.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This explains what’s being addressed and what isn’t.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'This draws a clear line between the two interpretations.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This clarifies the distinction without comparison.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.04, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This is about defining boundaries, not ranking options.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This makes clear what the concept covers.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This removes confusion by stating what does not apply.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.contrast', padPleasure:0.06, padArousal:0.02, padDominance:-0.03 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.explain (contrast / clarify_confusion) batch import...');
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
