import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.build_rapport';

const utterances = [
  // 1
  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s good to meet you, <SUBJECT>; your arrival stirred a quiet note on the Council of the Wise’s old radar screens.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.20,
    padDominance: 0.00,
  },
  // 2
  {
    speakerCharacterId: '700002',
    utteranceText: 'Welcome in—some of the Council elders paused earlier, wondering who might be stepping through today.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.61,
    padArousal: 0.20,
    padDominance: 0.01,
  },
  // 3
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m glad you’re here, <SUBJECT>, and you may notice gentle echoes from the Council if you listen closely.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.19,
    padDominance: 0.00,
  },
  // 4
  {
    speakerCharacterId: '700002',
    utteranceText: 'Your presence drew a faint shimmer across one of the Council’s monitors, though they’d never rush you to explain it.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.19,
    padDominance: 0.00,
  },
  // 5
  {
    speakerCharacterId: '700002',
    utteranceText: 'It seems your first step here caught the Council’s attention, <SUBJECT>, in the soft way they notice new stories beginning.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.61,
    padArousal: 0.20,
    padDominance: 0.01,
  },
  // 6
  {
    speakerCharacterId: '700002',
    utteranceText: 'You might hear whispers about the Council of the Wise; they tend to notice people arriving with steady curiosity.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.59,
    padArousal: 0.19,
    padDominance: -0.01,
  },
  // 7
  {
    speakerCharacterId: '700002',
    utteranceText: 'The Council’s instruments flickered when you appeared, <SUBJECT>, though they remain patient about what it means.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.20,
    padDominance: 0.00,
  },
  // 8
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you’ve heard of the Council, you’ll know they listen quietly when someone new enters the realm.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.59,
    padArousal: 0.18,
    padDominance: -0.01,
  },
  // 9
  {
    speakerCharacterId: '700002',
    utteranceText: 'Some say the Council’s lanterns glow a bit brighter when a new traveller steps inside, <SUBJECT>.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.20,
    padDominance: 0.01,
  },
  // 10
  {
    speakerCharacterId: '700002',
    utteranceText: 'The elders rarely speak first, but they do pay attention when someone arrives with your kind of thoughtful presence.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.19,
    padDominance: 0.00,
  },
  // 11
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m here beside you, <SUBJECT>, if you’re curious about who the Council are or why they keep such gentle watch.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.61,
    padArousal: 0.20,
    padDominance: 0.01,
  },
  // 12
  {
    speakerCharacterId: '700002',
    utteranceText: 'The Council prefers to observe rather than intervene, though they noted your arrival as a promising sign.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.59,
    padArousal: 0.19,
    padDominance: 0.00,
  },
  // 13
  {
    speakerCharacterId: '700002',
    utteranceText: 'You’re welcome to ask about the Council of the Wise at any time; they tend to appreciate open questions.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.20,
    padDominance: 0.00,
  },
  // 14
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you’ve crossed paths with tales of the Council, you might find they resonate more clearly now that you’re here.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.19,
    padDominance: 0.00,
  },
  // 15
  {
    speakerCharacterId: '700002',
    utteranceText: 'The Council noticed your arrival, <SUBJECT>, but they leave all choices about the path ahead entirely with you.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.61,
    padArousal: 0.20,
    padDominance: 0.01,
  },
  // 16
  {
    speakerCharacterId: '700002',
    utteranceText: 'There’s no pressure to explore their lore, though the Council always welcomes a sincere enquiry.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.59,
    padArousal: 0.18,
    padDominance: -0.01,
  },
  // 17
  {
    speakerCharacterId: '700002',
    utteranceText: 'I can help you understand who the Council are whenever you feel ready, <SUBJECT>.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.19,
    padDominance: 0.00,
  },
  // 18
  {
    speakerCharacterId: '700002',
    utteranceText: 'If the idea of the Council feels unfamiliar, that’s alright—we can approach it gently together.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.18,
    padDominance: -0.01,
  },
  // 19
  {
    speakerCharacterId: '700002',
    utteranceText: 'The Council’s attention is never a demand; it’s more like a quiet invitation to learn at your own pace.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.19,
    padDominance: 0.00,
  },
  // 20
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you’re wondering why the Council noticed you, <SUBJECT>, that question alone is a good place to begin.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.61,
    padArousal: 0.20,
    padDominance: 0.01,
  },
  // 21
  {
    speakerCharacterId: '700002',
    utteranceText: 'Their radars flicker for many reasons, and your arrival simply added a new note worth listening to.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.59,
    padArousal: 0.19,
    padDominance: 0.00,
  },
  // 22
  {
    speakerCharacterId: '700002',
    utteranceText: 'Should curiosity about the Council arise, <SUBJECT>, we can explore their role in the realm step by step.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.20,
    padDominance: 0.00,
  },
  // 23
  {
    speakerCharacterId: '700002',
    utteranceText: 'Some travellers feel the Council before they understand them, and that’s perfectly normal here.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.19,
    padDominance: 0.00,
  },
  // 24
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you’re interested, you can ask whether the Council has crossed paths with someone like you before.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.60,
    padArousal: 0.20,
    padDominance: 0.00,
  },
  // 25
  {
    speakerCharacterId: '700002',
    utteranceText: 'The Council’s attention is gentle, <SUBJECT>, and you can decide if or when you want to learn more about them.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'social.greet',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.61,
    padArousal: 0.20,
    padDominance: 0.01,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM social.greet expressive.encourage welcome council batch import...');
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
      const source = 'ltlmbrief.social.greet.expressive.encourage.welcome_council';
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
    console.log('LTLM social.greet expressive.encourage welcome council batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM social.greet expressive.encourage welcome council batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM social.greet expressive.encourage welcome council batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM social.greet expressive.encourage welcome council batch import script');
    console.error(err);
    process.exitCode = 1;
  });
