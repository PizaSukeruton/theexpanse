import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.reframe_perspective';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'As this part winds down, you might notice one thing you learned about yourself here that could travel with you into whatever comes next.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.10,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if you look back over this stretch, what stands out as a small insight you would like to remember rather than lose?',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.10,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You might treat this ending as a bookmark, asking yourself, “What did this experience show me about what helps, and what does not?” and carrying that forward.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.10,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, even if parts of this felt messy, there is likely one clear thread you can name—about your needs, your limits, or your strengths—that is worth keeping.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You could gently ask, “What would future‑me be glad I understood from this?” and let that question shape how you file this away in your memory.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.10,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, instead of only replaying what was hard, you might also notice what this experience taught you about where you want to be gentler with yourself next time.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'One way to close this is to name a single practical adjustment you want to experiment with because of what you noticed here, even if it is very small.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.10,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it can help to frame this not as a failure or a win, but as a source of data about what supports you and what drains you, so you can tune things a little next time.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.10,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'As you step out of this moment, you might summarise it for yourself in one or two sentences that feel fair and kind, rather than harsh or dismissive.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the meaning you give this experience is still being written; you are allowed to decide that it becomes a reference point for growth rather than just another difficult memory.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'structure_beats.closing',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.10,
    padDominance: 0.16
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
