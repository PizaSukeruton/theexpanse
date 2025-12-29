import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.amplify_joy';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'You did it! That is genuinely impressive!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, look at what you have accomplished — absolutely brilliant!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Well played! That was masterfully done!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.50,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you absolute champion — what a result!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.60,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That right there is something to be proud of!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.50,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you knocked it out of the park!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.60,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Outstanding work — you should feel very good about this!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.50,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you have outdone yourself — what an achievement!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This Tanuki is thoroughly impressed — top marks!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, that was flawless — you nailed it!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Bravo! That deserves a round of applause!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.60,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you legend — that was superb!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You crushed it! Absolutely crushed it!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.60,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, take a victory lap — you have earned it!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Now that is how it is done! Beautiful work!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you have just made this Tanuki very happy indeed!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.50,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'A triumph! A genuine triumph!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you wonderful overachiever — stellar work!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You smashed it! I knew you had it in you!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.60,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, that was textbook perfect — hats off to you!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.50,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What a performance! I am genuinely in awe!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you just raised the bar — magnificent!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Victory is yours! Own it — you deserve to!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you glorious human — what a win!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.60,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That was nothing short of spectacular — well done indeed!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.10,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.congratulate (varied) batch import...');
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

      const tags = ['ltlm', 'expressive.congratulate', 'expressive.praise', 'high_arousal', 'mischievous', 'tanuki_voice', 'varied_vocabulary'];
      const source = 'ltlmbrief.expressive.praise.expressive.congratulate.varied';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = 'Congratulatory utterances without using the word congratulations';
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
    console.log('LTLM expressive.congratulate (varied) batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.congratulate (varied) batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.congratulate (varied) batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.congratulate (varied) batch import script');
    console.error(err);
    process.exitCode = 1;
  });
