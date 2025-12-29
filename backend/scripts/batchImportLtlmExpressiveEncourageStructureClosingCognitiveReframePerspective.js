import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.reframe_perspective';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, instead of reading this as proof that you are failing, you might see it as evidence that you stayed in the ring with something genuinely hard.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.08,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'One way to view this is not “I am back at the start”, but “I know more about myself and my limits now than I did last time I was here.”',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.08,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you could treat this not as a setback, but as another data point in how you respond under strain, which you can use to shape future choices.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.08,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Instead of asking “Why am I like this?”, you might ask “Given everything I have been carrying, is my reaction actually understandable?” and see what that opens up.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.08,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, this does not have to be the story of you “not coping”; it can also be the story of you noticing earlier and reaching for different supports.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.08,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You might reframe this from “I did not do enough” to “I did what I could with the energy, information, and support I had at the time.”',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.08,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, rather than seeing the hard feelings as a sign you are weak, you could see them as a sign of how deeply you care about what is at stake here.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.08,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Another angle is to notice that the part of you that is criticising is also the part that wants more for you; it just does not yet know how to speak kindly.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.08,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you might see this chapter less as a verdict and more as a rehearsal—a place where you are learning moves you can reuse when the stakes feel similar later.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.08,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Instead of “I have wasted time,” you might try “I have spent time finding out what does and does not work for me,” which is still real learning.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.08,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, whatever else is true, this story can include the fact that you stayed curious about yourself instead of shutting down completely, and that matters.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.08,
    padDominance: 0.15
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + structure_beats.closing + cognitive_outcomes.reframe_perspective batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'structure_beats.closing', 'cognitive_outcomes.reframe_perspective'];
      const source = 'ltlmbrief.expressive.encourage.structure_beats.closing.cognitive_outcomes.reframe_perspective';
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
    console.log('LTLM expressive.encourage + structure_beats.closing + cognitive_outcomes.reframe_perspective batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + structure_beats.closing + cognitive_outcomes.reframe_perspective batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + structure_beats.closing + cognitive_outcomes.reframe_perspective batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + structure_beats.closing + cognitive_outcomes.reframe_perspective batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
