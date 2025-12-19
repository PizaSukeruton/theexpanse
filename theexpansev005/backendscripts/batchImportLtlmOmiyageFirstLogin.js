import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.build_rapport';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'I passed through a quiet place on my way here, and a few small things came along with me. I brought them with you in mind.',
    dialogueFunctionCode: 'social_obligations_management.greet',
    speechActCode: 'commissive.offer',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.35,
    padArousal: 0.15,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The old paths always leave something in my pockets. A few of those things felt meant for you, <SUBJECT>.',
    dialogueFunctionCode: 'social_obligations_management.greet',
    speechActCode: 'commissive.offer',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.35,
    padArousal: 0.15,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Between one world and the next, I stopped to rest and gathered a handful of small keepsakes.',
    dialogueFunctionCode: 'social_obligations_management.greet',
    speechActCode: 'commissive.offer',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.35,
    padArousal: 0.15,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'A Tanuki never travels light, but never travels alone either. I brought a few gentle things along.',
    dialogueFunctionCode: 'social_obligations_management.greet',
    speechActCode: 'commissive.offer',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.35,
    padArousal: 0.15,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I slipped through the in-between places to get here. Something small followed me the whole way.',
    dialogueFunctionCode: 'social_obligations_management.greet',
    speechActCode: 'commissive.offer',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.35,
    padArousal: 0.15,
    padDominance: 0.10
  }
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM omiyage first-login batch import...');
    await client.query('BEGIN');

    for (const u of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');
      const emotionRegisterId = null;

      const insertExampleSql = `
        INSERT INTO ltlm_training_examples
        (
          training_example_id,
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
          created_by
        )
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      `;

      const tags = [
        'ltlm',
        'omiyage',
        'first_login',
        'commissive.offer',
        'social_obligations_management.greet'
      ];

      const source = 'ltlmbrief.omiyage.first_login.commissive.offer';

      await client.query(insertExampleSql, [
        trainingExampleId,
        u.speakerCharacterId,
        u.utteranceText,
        u.dialogueFunctionCode,
        u.speechActCode,
        u.narrativeFunctionCodeRaw,
        u.padPleasure,
        u.padArousal,
        u.padDominance,
        emotionRegisterId,
        source,
        true,
        1,
        tags,
        1.0,
        null,
        '700002'
      ]);

      if (u.outcomeIntentCodeRaw) {
        const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');
        await client.query(
          `
          INSERT INTO ltlm_training_outcome_intents
          (
            ltlm_outcome_intent_id,
            training_example_id,
            outcome_intent_code
          )
          VALUES
          ($1,$2,$3)
          `,
          [
            outcomeIntentId,
            trainingExampleId,
            u.outcomeIntentCodeRaw
          ]
        );
      }
    }

    await client.query('COMMIT');
    console.log('LTLM omiyage first-login batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM omiyage batch import failed. Rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run();
