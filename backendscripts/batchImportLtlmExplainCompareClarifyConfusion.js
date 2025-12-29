import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'The difference between these two is mainly in how they’re used.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This option focuses on speed, while the other focuses on accuracy.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.04, padArousal:0.04, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'One approach is simpler, the other more flexible.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.04, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'The key contrast here is between control and convenience.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This works differently from the other method in a few ways.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.04, padArousal:0.03, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'Compared side by side, the differences become clearer.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'One option emphasizes structure, the other flexibility.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'The main distinction is how each handles the process.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This approach is more direct, while the other is more gradual.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.04, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'They aim for the same outcome but get there differently.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'One is designed for clarity, the other for flexibility.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.04, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'The difference shows up in how each step is handled.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This method trades simplicity for control.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'The other option prioritizes ease over precision.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Looking at them together helps reduce confusion.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'One approach is more rigid, the other more adaptable.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'They differ mainly in how much control they offer.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'This option favors predictability, the other flexibility.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Comparing them makes the choice clearer.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'They solve the same problem in different ways.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.02 },

  { speakerCharacterId:'700002', utteranceText:'The contrast lies in how each option behaves.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.04, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This one emphasizes consistency, the other adaptability.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Side by side, the differences are easier to see.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Each approach has a different trade-off.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.04, padArousal:0.03, padDominance:-0.02 },
  { speakerCharacterId:'700002', utteranceText:'Comparing them helps clarify what’s different.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.02, padDominance:-0.03 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.explain (compare / clarify_confusion) batch import...');
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
