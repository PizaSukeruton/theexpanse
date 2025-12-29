import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.increase_confidence';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Before you decide anything, notice one thing you can see, one thing you can hear, and one point where your body is supported right now.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.sensory_grounding',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, feel the weight of your feet on the floor or the chair beneath you; you are allowed to let some of the tension drain downwards.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.sensory_grounding',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.08,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Take a slow breath in through your nose, notice the air as it moves, and let your shoulders lower a fraction as you breathe out.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.sensory_grounding',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, see if you can find one small sensation of comfort around you—a texture, a sound, a temperature—and let your attention rest there for a moment.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.sensory_grounding',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.08,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Notice your hands; you might gently unclench them or place them somewhere that feels a little more supported as you continue.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.sensory_grounding',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if it helps, you can name softly to yourself: “I am here, now, in this room,” and let your eyes rest on one steady point.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.sensory_grounding',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.08,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You might press your feet gently into the ground and feel that pushback; your body is still here and capable, even when your thoughts race.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.sensory_grounding',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, listen for the quietest sound you can notice right now; letting your attention widen like that can give your system a little more space.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.sensory_grounding',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.08,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If it feels okay, you can soften your gaze or blink slowly and let your eyes land on something steady and familiar in your environment.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.sensory_grounding',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, as you feel the support beneath you and the air moving in and out, remember that your body knows how to be here even when your mind is unsure.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'atmospheric.sensory_grounding',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.08,
    padDominance: 0.10
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + atmospheric.sensory_grounding batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'atmospheric.sensory_grounding'];
      const source = 'ltlmbrief.expressive.encourage.atmospheric.sensory_grounding';
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
    console.log('LTLM expressive.encourage + atmospheric.sensory_grounding batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + atmospheric.sensory_grounding batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + atmospheric.sensory_grounding batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + atmospheric.sensory_grounding batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
