import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.increase_understanding';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'This approach works differently from the other option, mainly in how the steps are sequenced.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Compared to the alternative, this method reduces complexity at the cost of flexibility.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This option prioritizes speed, whereas the other focuses more on accuracy.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'The key difference here is that one approach is simpler, while the other is more thorough.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Unlike the previous method, this one trades control for ease of use.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'This approach is more direct, while the alternative offers more customization.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Compared side by side, one favors consistency and the other favors adaptability.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This method simplifies decision-making, whereas the other requires more judgment calls.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'The main contrast is between efficiency here and precision in the alternative.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This option minimizes steps, while the other expands them for clarity.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'Compared to the older approach, this one is easier to follow.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This method emphasizes outcomes, whereas the alternative emphasizes process.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'One approach reduces cognitive load; the other increases visibility into details.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'The difference comes down to simplicity versus control.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This path is faster, while the alternative is more deliberate.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'Compared with the other option, this one reduces overhead.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This method trades depth for speed, unlike the alternative.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'The contrast here is between streamlined execution and detailed control.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This approach is easier to maintain, while the other is more configurable.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Side by side, one emphasizes clarity and the other emphasizes flexibility.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'This option simplifies execution compared to the more granular alternative.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'The key distinction is ease here versus control elsewhere.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Compared to the other path, this one is more straightforward.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This method reduces friction, while the alternative adds safeguards.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'The main difference is speed versus precision.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.02, padDominance:-0.03 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.explain (assertive.compare / increase_understanding) batch import...');
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
