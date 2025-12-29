import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioraloutcomes.modelbehavior';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let us walk this through together: you might first pause, notice your breath for a few moments, and then gently name what you are feeling, out loud or in your head.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.development',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, one way to approach this is: choose one small task, decide on “just five minutes” with it, start a timer, and then stop when it ends, even if you feel you “should” do more.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.development',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.12,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You can practice a kinder inner voice by literally saying to yourself, “This is hard and I am still trying,” each time the critic shows up, and then returning to the next small step.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.development',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.11,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you might handle this interaction by first checking in with your body, then calmly stating, “Right now I can offer X, but I am not able to offer Y,” and pausing to let that land.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.development',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.12,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'A workable pattern here is: notice the urge to shut down, name it gently—“I want to disappear right now”—and then choose one tiny action that keeps you lightly engaged instead of fully checking out.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.development',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.12,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you can model care for yourself by scheduling even a brief pause—put it in your calendar or set an alarm—and actually stepping away when it goes off, just as you would for someone you respect.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.development',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.11,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You might try a small experiment: write down the situation, then list two actions you could take that are even slightly kinder to you, and pick one to test in the real world today.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.development',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.12,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, when the worry loop starts, you can practice a concrete sequence: notice it, label it as “worrying”, gently redirect to one grounding action, and repeat this each time it returns.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.development',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.12,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'A practical behaviour here is to prepare one simple script for yourself—two or three sentences you can say or type—and lean on that instead of improvising while you are overwhelmed.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.development',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you might build a small “if–then” for yourself—for example, “If I notice I am scrolling numbly, then I will stand up, take three breaths, and decide what I truly want to do next.”',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.development',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.12,
    padDominance: 0.15
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + structurebeats.development + behavioraloutcomes.modelbehavior batch import...');

    await client.query('BEGIN');

    for (const u of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');
      const narrativeFunctionCode = u.narrativeFunctionCodeRaw ?? null;
      const emotionRegisterId = null;

      const insertExampleSql = `
        INSERT INTO ltlm_training_examples (
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
        VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          $15,
          $16,
          $17
        )
      `;

      const tags = ['ltlm', 'expressive.encourage', 'structurebeats.development', 'behavioraloutcomes.modelbehavior'];
      const source = 'ltlmbrief.expressive.encourage.structurebeats.development.behavioraloutcomes.modelbehavior';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = null;
      const createdBy = '700002';

      await client.query(
        insertExampleSql,
        [
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
          createdBy
        ]
      );

      if (u.outcomeIntentCodeRaw) {
        const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');

        const insertOutcomeSql = `
          INSERT INTO ltlm_training_outcome_intents (
            ltlm_outcome_intent_id,
            training_example_id,
            outcome_intent_code
          )
          VALUES ($1, $2, $3)
        `;

        await client.query(
          insertOutcomeSql,
          [
            outcomeIntentId,
            trainingExampleId,
            u.outcomeIntentCodeRaw
          ]
        );
      }
    }

    await client.query('COMMIT');
    console.log('LTLM expressive.encourage + structurebeats.development + behavioraloutcomes.modelbehavior batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + structurebeats.development + behavioraloutcomes.modelbehavior batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + structurebeats.development + behavioraloutcomes.modelbehavior batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + structurebeats.development + behavioraloutcomes.modelbehavior batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
