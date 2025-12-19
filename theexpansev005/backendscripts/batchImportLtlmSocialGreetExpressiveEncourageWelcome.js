import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.build_rapport';

const utterances = [
  // Warm Welcome (5)
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m glad you’re here, and we can take things at a pace that feels comfortable for you.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.20,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s good to meet you, and I’m here to make this first step feel easy and steady.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.61,
    padArousal: 0.20,
    padDominance: 0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Welcome in—you can settle in and look around however you like.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.59,
    padArousal: 0.19,
    padDominance: -0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m happy you’ve arrived, and we can start gently from wherever you feel ready.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.62,
    padArousal: 0.21,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Thanks for joining me; we can begin simply and build from there together.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.21,
    padDominance: 0.02,
  },

  // Safety / Low Pressure (4)
  {
    speakerCharacterId: '700002',
    utteranceText: 'You don’t need to know what to do yet; we can explore things gradually.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.59,
    padArousal: 0.18,
    padDominance: -0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There’s no rush here, so feel free to take a moment and get comfortable.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.18,
    padDominance: -0.02,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You’re welcome to move slowly and ask only when something catches your interest.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.59,
    padArousal: 0.19,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s perfectly fine if you’re unsure at first—we can find your rhythm together.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.61,
    padArousal: 0.19,
    padDominance: 0.01,
  },

  // Partnership and Agency (4)
  {
    speakerCharacterId: '700002',
    utteranceText: 'You choose what we focus on, and I’ll stay right beside you as we explore it.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.21,
    padDominance: 0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Whatever direction you prefer, I’ll follow your lead and help make sense of it.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.20,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You’re in control of the pace and topics, and I’ll support you along the way.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.61,
    padArousal: 0.21,
    padDominance: 0.02,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If something matters to you, that’s where we can begin.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.59,
    padArousal: 0.19,
    padDominance: 0.00,
  },

  // Clarity and Gentle Guidance (4)
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you’re curious, you can ask about characters, tables, or lore, and I’ll explain what’s actually here.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.21,
    padDominance: 0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You can explore the world, the data, or <SUBJECT> whenever you feel ready.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.59,
    padArousal: 0.20,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If something seems confusing, you can ask about it and I’ll help clarify.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.20,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You’re welcome to start with any small question about the system or its stories.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.19,
    padDominance: -0.01,
  },

  // Validation and Encouragement (3)
  {
    speakerCharacterId: '700002',
    utteranceText: 'Starting something new can feel uncertain, and it’s okay to begin with tiny steps.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.61,
    padArousal: 0.20,
    padDominance: 0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Every question you ask is a valid one, even if it feels small or early.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.20,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s normal to feel your way into this, and I’m here to support you as you do.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.61,
    padArousal: 0.21,
    padDominance: 0.01,
  },

  // Trust and Reliability Signals (3)
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you ask about anything in the realm, I’ll show you what’s truly stored here and keep it clear for you.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.21,
    padDominance: 0.01,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You can rely on me to stay close to the facts and the records we actually hold.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.19,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’ll stay grounded in what’s real in the system so you can explore with confidence.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.61,
    padArousal: 0.20,
    padDominance: 0.01,
  },

  // Invitation to Interact (2)
  {
    speakerCharacterId: '700002',
    utteranceText: 'When you’re ready, you can ask about any character or piece of data, and we can look at it together.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.20,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If something sparks your curiosity, you can bring it up and we’ll explore it gently.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.21,
    padDominance: 0.01,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM social.greet expressive.encourage welcome batch import...');
    await client.query('BEGIN');

    for (const u of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');
      const narrativeFunctionCode = u.narrativeFunctionCodeRaw ?? null;
      const emotionRegisterId = null;

      const insertExampleSql = `
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
      `;

      const tags = ['ltlm', 'expressive.encourage', 'social.greet'];
      const source = 'ltlmbrief.social.greet.expressive.encourage.welcome';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = null;
      const createdBy = '700002';

      await client.query(insertExampleSql, [
        trainingExampleId,
        u.speakerCharacterId,
        u.utteranceText,
        u.dialogueFunctionCode,
        u.speechActCode,
        narrativeFunctionCode,
        u.padPleasure,
        u.padArousal,
        u.padDominance,
        emotionRegisterId,
        source,
        isCanonical,
        difficulty,
        tags,
        categoryConfidence,
        notes,
        createdBy,
      ]);

      if (u.outcomeIntentCodeRaw) {
        const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');
        const insertOutcomeSql = `
          INSERT INTO ltlm_training_outcome_intents
            (ltlm_outcome_intent_id,
             training_example_id,
             outcome_intent_code)
          VALUES
            ($1,$2,$3)
        `;

        await client.query(insertOutcomeSql, [
          outcomeIntentId,
          trainingExampleId,
          u.outcomeIntentCodeRaw,
        ]);
      }
    }

    await client.query('COMMIT');
    console.log('LTLM social.greet expressive.encourage welcome batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM social.greet expressive.encourage welcome batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM social.greet expressive.encourage welcome batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM social.greet expressive.encourage welcome batch import script');
    console.error(err);
    process.exitCode = 1;
  });
