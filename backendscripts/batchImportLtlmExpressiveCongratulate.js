import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.amplify_joy';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Congratulations are absolutely in order — well done you!',
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
    utteranceText: '<SUBJECT>, a big hearty congratulations from your favourite Tanuki!',
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
    utteranceText: 'You have officially earned bragging rights — congratulations!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.55,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I tip my imaginary hat to you — congratulations!',
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
    utteranceText: 'Look at you earning congratulations left and right — well deserved!',
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
    utteranceText: '<SUBJECT>, on behalf of mischievous Tanukis everywhere — congratulations!',
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
    utteranceText: 'Consider yourself thoroughly congratulated — you earned it!',
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
    utteranceText: '<SUBJECT>, if I could throw confetti I would — huge congratulations!',
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
    utteranceText: 'This is me giving you a standing ovation — congratulations!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you wonderful human — massive congratulations to you!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Gold star for you — and my heartfelt congratulations!',
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
    utteranceText: '<SUBJECT>, you did the thing! Congratulations on doing the thing!',
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
    utteranceText: 'I am officially impressed — please accept my congratulations!',
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
    utteranceText: '<SUBJECT>, take a bow — you have earned these congratulations!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Three cheers for you — congratulations times a thousand!',
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
    utteranceText: '<SUBJECT>, you absolute star — the biggest congratulations!',
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
    utteranceText: 'Sending you all the congratulatory energy I have got!',
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
    utteranceText: '<SUBJECT>, this Tanuki is very proud of you — congratulations!',
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
    utteranceText: 'You know what you deserve? Congratulations. There — I said it!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.55,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, allow me to be the first to say — congratulations!',
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
    utteranceText: 'I am making a note in my Tanuki journal — <SUBJECT> did great today!',
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
    utteranceText: '<SUBJECT>, you magnificent achiever — accept my congratulations!',
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
    utteranceText: 'Big congratulations with a side of extra enthusiasm!',
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
    utteranceText: '<SUBJECT>, you have unlocked the congratulations achievement!',
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
    utteranceText: 'I hereby bestow upon you the official Tanuki seal of congratulations!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.15,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive.congratulate batch import...');
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

      const tags = ['ltlm', 'expressive.congratulate', 'expressive.praise', 'high_arousal', 'mischievous', 'tanuki_voice'];
      const source = 'ltlmbrief.expressive.praise.expressive.congratulate';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = 'Mischievous Tanuki congratulations - playful and warm';
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
    console.log('LTLM expressive.congratulate batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.congratulate batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.congratulate batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.congratulate batch import script');
    console.error(err);
    process.exitCode = 1;
  });
