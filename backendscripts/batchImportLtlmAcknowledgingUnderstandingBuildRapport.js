import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.build_rapport';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'I understand what you mean, and I appreciate you sharing it.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'That makes sense to me, thanks for explaining.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I see what you’re saying, and I’m glad you told me.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I’m following you, and I appreciate the context.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'That’s clear to me, thanks for walking me through it.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'I understand, and I appreciate you taking the time.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I see what you’re getting at—thanks for explaining.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'That makes sense, and I’m glad you shared it.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I follow you, and I appreciate the explanation.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I understand your point—thank you for clarifying.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'That’s clear, and I appreciate you explaining it.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I’m with you, thanks for taking the time.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I see how that fits, and I appreciate the detail.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I understand what you’re saying—thanks for sharing.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'That makes sense, and I appreciate your openness.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },

  { speakerCharacterId:'700002', utteranceText:'I follow your reasoning, thanks for explaining.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I see what you mean, and I appreciate the clarity.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'That’s clear now—thanks for taking the time.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I understand, and I value you explaining it.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I’m following along—thanks for sharing this.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'That makes sense to me, and I appreciate the insight.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I see your point, and I’m glad you shared it.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },
  { speakerCharacterId:'700002', utteranceText:'I understand, and thanks for being clear.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'That’s clear, and I appreciate the explanation.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.08, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I’m with you, and I appreciate you sharing this.', dialogueFunctionCode:'auto_feedback.acknowledging_understanding', speechActCode:'expressive', padPleasure:0.09, padArousal:0.02, padDominance:-0.06 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM auto_feedback.acknowledging_understanding (expressive / build_rapport) batch import...');
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
          'ltlmbrief.auto_feedback.acknowledging_understanding',
          true,
          1,
          ['ltlm','auto_feedback.acknowledging_understanding'],
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
