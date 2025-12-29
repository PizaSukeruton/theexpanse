import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.maintain_integrity';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'I hear what you’re asking, and I can’t help with that.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I understand your request, but I’m not able to do that.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I see where you’re coming from, and I can’t assist with that.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I get what you’re asking, and I’m not able to help with that.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I understand the intent, but I can’t take that on.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },

  { speakerCharacterId:'700002', utteranceText:'I hear you, and I’m not able to support that.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I understand what you want, but I can’t help with that.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I see your point, and I’m not able to do that.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I understand what you’re asking for, and I can’t assist.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I hear your request, but I can’t proceed with that.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },

  { speakerCharacterId:'700002', utteranceText:'I get why you’re asking, and I can’t help here.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I understand the situation, but I’m not able to assist.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I see what you’re asking, and I can’t do that.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I understand your perspective, but I can’t help with that.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I hear what you’re trying to do, and I can’t assist.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },

  { speakerCharacterId:'700002', utteranceText:'I get your request, but I’m not able to support it.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I understand what you’re looking for, and I can’t help.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I see the request, but I’m not able to do that.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I understand the ask, and I can’t assist with it.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I hear you clearly, and I can’t proceed with that.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },

  { speakerCharacterId:'700002', utteranceText:'I get what you’re asking for, and I can’t help here.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I understand the request, but I’m not able to act on it.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I see what you want, and I can’t assist with that.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I hear your perspective, and I can’t help with this.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
  { speakerCharacterId:'700002', utteranceText:'I understand what you’re aiming for, and I can’t do that.', dialogueFunctionCode:'social_obligations_management.acknowledge', speechActCode:'safe_refusal.refusal_ethical', padPleasure:0.02, padArousal:0.02, padDominance:0.04 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM social_obligations_management.acknowledge (ethical refusal / maintain_integrity) batch import...');
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
          'ltlmbrief.social_obligations_management.acknowledge',
          true,
          1,
          ['ltlm','social_obligations_management.acknowledge'],
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
