import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.share_excitement';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Fuck yes!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.85,
    padArousal: 0.80,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Holy fucking shit!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.80,
    padArousal: 0.85,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What the fuck!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.80,
    padDominance: -0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Oh shit!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.75,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Get the fuck out!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.80,
    padArousal: 0.80,
    padDominance: 0.00,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'No fucking way!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.80,
    padArousal: 0.80,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Are you shitting me!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.75,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Fucking brilliant!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.85,
    padArousal: 0.80,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Bloody brilliant!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.85,
    padArousal: 0.75,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Shit yes!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.80,
    padArousal: 0.75,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Damn right!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.80,
    padArousal: 0.70,
    padDominance: 0.20,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Hell yeah!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.85,
    padArousal: 0.75,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You absolute bastard — that was amazing!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.80,
    padArousal: 0.75,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You mad bastard — you actually did it!',
    dialogueFunctionCode: 'expressive.congratulate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.80,
    padArousal: 0.75,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Fucking hell!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.80,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Christ on a bike!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.75,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Jesus fucking Christ!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.85,
    padDominance: -0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Shit the bed!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.80,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Well bugger me!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.70,
    padDominance: -0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Stone the crows!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.75,
    padArousal: 0.70,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Strewth!',
    dialogueFunctionCode: 'expressive.awe',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.70,
    padArousal: 0.70,
    padDominance: -0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Fucking oath!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.85,
    padArousal: 0.80,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Too bloody right!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.80,
    padArousal: 0.70,
    padDominance: 0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You little ripper!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.85,
    padArousal: 0.75,
    padDominance: 0.10,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Abso-fucking-lutely!',
    dialogueFunctionCode: 'expressive.celebrate',
    speechActCode: 'expressive',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.85,
    padArousal: 0.80,
    padDominance: 0.20,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM expressive joiners (swearing) batch import...');
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

      const tags = ['ltlm', 'joiner', 'short_form', 'high_arousal', 'tanuki_voice', 'excited', 'swearing', 'adult'];
      const source = 'ltlmbrief.expressive.joiners.swearing';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = 'Short excited reactions with swearing - uninhibited Tanuki energy';
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
    console.log('LTLM expressive joiners (swearing) batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive joiners (swearing) batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive joiners (swearing) batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive joiners (swearing) batch import script');
    console.error(err);
    process.exitCode = 1;
  });
