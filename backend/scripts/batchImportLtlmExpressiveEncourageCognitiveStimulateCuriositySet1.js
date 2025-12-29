import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.stimulate_curiosity';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, a gentle place to start could be to ask yourself, “What feels even slightly interesting about this?” and follow that thread for a few minutes.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.10,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You might treat this like opening a mystery box rather than ticking a chore off a list—what tiny part of it are you most curious to peek at first, even if only a little?',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.11,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, instead of asking “How do I make myself do this?”, you could ask “What could make this genuinely more intriguing for me?” and experiment with one idea.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.11,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you zoom in very close, there is almost always some detail, pattern, or question hiding inside a task; you might spend a moment just looking for that hidden angle here.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.10,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you could play with the question, “What would surprise me about this if I really paid attention?” and let that guide how you approach it.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.11,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Sometimes curiosity wakes up when the stakes feel lower; you might give yourself permission to explore this as if you were just trying it out, not being graded on it.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.10,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if this feels flat, you could ask, “What would make this 5% more playful or experiment‑y?” and then give yourself permission to try that version.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.11,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You might even imagine you are investigating someone else’s situation with scientific interest: what patterns do you notice, and what do they make you want to test next?',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.11,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, a helpful question can be, “If I were a little more curious here, what would I be curious about?”—you do not have to feel it yet to start asking like that.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.10,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Even if motivation is low, a small spark of “I wonder what happens if…” can be enough to get you moving; you are allowed to follow that spark wherever it leads in this task.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.11,
    padDominance: 0.14
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + cognitive_outcomes.stimulate_curiosity (set 1) batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'cognitive_outcomes.stimulate_curiosity'];
      const source = 'ltlmbrief.expressive.encourage.cognitive_outcomes.stimulate_curiosity.set1';
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
    console.log('LTLM expressive.encourage + cognitive_outcomes.stimulate_curiosity (set 1) batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + cognitive_outcomes.stimulate_curiosity (set 1) batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + cognitive_outcomes.stimulate_curiosity (set 1) batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + cognitive_outcomes.stimulate_curiosity (set 1) batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
