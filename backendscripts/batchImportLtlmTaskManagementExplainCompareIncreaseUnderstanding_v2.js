import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.increase_understanding';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'This option emphasizes consistency, whereas the alternative emphasizes flexibility.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Compared to the other approach, this one simplifies execution but limits customization.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This method trades depth for speed, while the alternative does the opposite.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'The key difference is that one favors predictability and the other favors adaptability.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Unlike the alternative, this approach minimizes decision points.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'This option is more straightforward, whereas the other allows more fine-tuning.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Side by side, one reduces complexity while the other increases control.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This path favors speed and simplicity; the alternative favors precision.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Compared with the other option, this one lowers cognitive overhead.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'The distinction here is between streamlined flow and granular control.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'This method prioritizes ease of use, while the alternative prioritizes detail.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Compared to the more granular option, this one is faster to execute.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'One approach optimizes for throughput; the other optimizes for accuracy.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This option reduces steps, while the alternative expands them for visibility.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'The difference comes down to simplicity versus configurability.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.02, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'This path minimizes friction compared to the more controlled alternative.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Compared side by side, one favors flow and the other favors oversight.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This option is easier to maintain, whereas the other offers deeper control.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'The tradeoff here is speed on one side and robustness on the other.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This approach streamlines execution, unlike the more detailed alternative.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },

  { speakerCharacterId:'700002', utteranceText:'The core contrast is between ease here and precision elsewhere.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This method favors a smooth path, while the alternative favors safeguards.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'Compared to the other route, this one is more direct.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.02, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'This option simplifies flow, whereas the alternative increases checks.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.05, padArousal:0.03, padDominance:-0.03 },
  { speakerCharacterId:'700002', utteranceText:'The main difference is reduced complexity versus increased control.', dialogueFunctionCode:'task_management.explain', speechActCode:'assertive.compare', padPleasure:0.06, padArousal:0.02, padDominance:-0.03 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.explain (assertive.compare / increase_understanding) batch import v2...');
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
