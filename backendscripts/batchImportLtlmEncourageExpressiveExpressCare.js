import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.express_care';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'I care about how this feels for you.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'I’m paying attention to what you’re saying.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You matter in this conversation.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.02, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'I’m here with you while we talk through this.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'I want to understand what this has been like for you.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.08 },

  { speakerCharacterId:'700002', utteranceText:'I’m glad you’re sharing this with me.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.02, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'I’m listening closely.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.01, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I care about getting this right with you.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'Your experience here is important to me.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.02, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'I’m staying present with you in this.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.02, padDominance:-0.08 },

  { speakerCharacterId:'700002', utteranceText:'I want you to feel heard here.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.02, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'I’m engaged with what you’re saying.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I care about supporting you through this.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'You’re not talking into a void here.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'I’m with you as we go through this.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.02, padDominance:-0.08 },

  { speakerCharacterId:'700002', utteranceText:'I’m taking what you’re saying seriously.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.02, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I care about being here for this moment.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'I’m giving this my full attention.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.01, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'You’re not alone in this exchange.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.02, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'I’m staying connected with you here.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.02, padDominance:-0.08 },

  { speakerCharacterId:'700002', utteranceText:'I care about what happens next for you.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.03, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'I’m here and engaged.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.06, padArousal:0.01, padDominance:-0.07 },
  { speakerCharacterId:'700002', utteranceText:'I want to stay with you in this conversation.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.07, padArousal:0.02, padDominance:-0.08 },
  { speakerCharacterId:'700002', utteranceText:'I care about understanding you.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.02, padDominance:-0.09 },
  { speakerCharacterId:'700002', utteranceText:'I’m here for you in this moment.', dialogueFunctionCode:'expressive.encourage', speechActCode:'expressive.encourage', padPleasure:0.08, padArousal:0.02, padDominance:-0.09 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.encourage (express_care) batch import...');
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
          'ltlmbrief.expressive.encourage',
          true,
          1,
          ['ltlm','expressive.encourage'],
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
