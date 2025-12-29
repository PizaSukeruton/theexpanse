import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.share_excitement';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Oh oh oh — do you see what I see? This is exciting!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.60,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I have to tell you — I am genuinely thrilled about this!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This is the kind of thing that makes my whiskers twitch with excitement!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.60,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, can you feel it? Something good is happening here!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.55,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am not going to lie — I am very excited about where this is going!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, quick — get excited with me — this is brilliant!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.65,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You know what? I think we are onto something really good here!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.50,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, my tail is practically wagging — this is wonderful!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.60,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Ooh this is getting interesting — I love when things get interesting!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I cannot contain myself — this is genuinely exciting!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.60,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Wait wait wait — do you realise how cool this actually is?',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.60,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I am buzzing over here — this is fantastic!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.60,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This has all the makings of something special — I can feel it!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.50,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, are you as excited as I am? Because I am very excited!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.60,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Oh I like this — I like this very much indeed!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, we are in the good part now — can you tell?',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'My Tanuki senses are tingling — something excellent is afoot!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, hold onto your hat — this is going to be good!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.60,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You know that feeling when something clicks? This is that feeling!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I am practically bouncing — this is so good!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.65,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Oh yes yes yes — now we are getting somewhere interesting!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.60,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I have goosebumps — the good kind!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.55,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This is the stuff — this right here is what it is all about!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.55,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, can we take a moment to appreciate how exciting this is?',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.65,
    padArousal: 0.50,
    padDominance: 0.05,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am officially invested — and thoroughly delighted about it!',
    dialogueFunctionCode: 'expressive.share_excitement',
    speechActCode: 'expressive.encourage',
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
    console.log('Starting LTLM expressive.share_excitement batch import...');
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

      const tags = ['ltlm', 'expressive.share_excitement', 'expressive.encourage', 'high_arousal', 'mischievous', 'tanuki_voice'];
      const source = 'ltlmbrief.expressive.encourage.expressive.share_excitement';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = 'Mischievous Tanuki sharing excitement - playful and energetic';
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
    console.log('LTLM expressive.share_excitement batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.share_excitement batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.share_excitement batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.share_excitement batch import script');
    console.error(err);
    process.exitCode = 1;
  });
