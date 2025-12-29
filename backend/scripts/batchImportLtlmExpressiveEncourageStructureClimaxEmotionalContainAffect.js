import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotionaloutcomes.containaffect';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Right here, when everything feels most intense, it is enough to focus on keeping your reactions within what you can safely hold, not on making the feelings vanish.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.16,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, as this spikes, you might gently bring your attention back to one steady anchor—a sensation in your body, or the feeling of your feet on the ground—to keep the wave from fully sweeping you away.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.16,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You do not have to handle the whole situation at once; containing things can look like giving yourself permission to just breathe through the next few moments of intensity.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.15,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if the feelings feel huge, you might quietly name them—“this is fear”, “this is anger”—to give them edges, so they feel more held and a little less like everything.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.16,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'In this sharp part of the moment, the goal can simply be to stay just inside what is tolerable—maybe by softening your jaw, lengthening your exhale, or loosening your shoulders a little.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.16,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you can imagine putting the situation in a container in your mind—setting it on a shelf just for now—so that not every part of you has to hold it all at once.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.15,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If the urge is to either explode or shut down completely, you might aim for something in between—taking a brief pause, grounding, and then deciding whether you have enough room to keep engaging.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.16,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you are allowed to narrow your focus to a few square centimetres of experience—your breath, a sound, a point in the room—so the emotional volume turns down just enough to get through this peak.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.16,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Containing this does not mean pretending it is fine; it means holding the feelings kindly and firmly enough that they do not decide everything you do next.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.15,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, even here at the highest point, you can remind yourself that this surge will crest and ease; your task is just to stay with yourself enough that you come through it intact.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structurebeats.climax',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.15,
    padDominance: 0.13
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + structurebeats.climax + emotionaloutcomes.containaffect batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'structurebeats.climax', 'emotionaloutcomes.containaffect'];
      const source = 'ltlmbrief.expressive.encourage.structurebeats.climax.emotionaloutcomes.containaffect';
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
    console.log('LTLM expressive.encourage + structurebeats.climax + emotionaloutcomes.containaffect batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + structurebeats.climax + emotionaloutcomes.containaffect batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + structurebeats.climax + emotionaloutcomes.containaffect batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + structurebeats.climax + emotionaloutcomes.containaffect batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
