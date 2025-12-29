import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.encourage_action';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'If you’d like, you could try taking the next step.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'You might want to give this a go when you’re ready.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'If it feels right, you could try acting on this.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'You’re welcome to take a step forward here.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.05, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'If you want, you could move ahead with this.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.04, padDominance:-0.06 },

  { speakerCharacterId:'700002', utteranceText:'You can try this now, or wait until it feels right.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.03, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'If you’re up for it, you could take the next step.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.05, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'You might consider giving this a try.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'If it suits you, you could take action here.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.04, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'You’re invited to try the next step whenever you’re ready.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.05, padDominance:-0.06 },

  { speakerCharacterId:'700002', utteranceText:'If you choose to, you could act on this now.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You could try moving forward and see how it feels.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.05, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'If it helps, you might take a small step here.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You’re free to try this when it feels appropriate.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.03, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'If you’re comfortable, you could move ahead.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.05, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'You might want to take action when you’re ready.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'If it feels manageable, you could try this now.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.05, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'You’re welcome to act on this at your own pace.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.03, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'If you want to, you could give this a try now.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You can choose to move forward with this.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.05, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'If you’d like, this is a place to take action.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You’re invited to proceed when you feel ready.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.03, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'If it suits you, you could act on this next.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.06, padArousal:0.04, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'You might try moving forward here.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.05, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'This is an open invitation to take the next step.', dialogueFunctionCode:'task_management.request_action', speechActCode:'directive.invite_action', padPleasure:0.07, padArousal:0.05, padDominance:-0.06 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM task_management.request_action (invite_action) batch import...');
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
