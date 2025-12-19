import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.comfort';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: "That sounds really heavy, and it makes sense if you're feeling worn down by all of this.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.05,
    padDominance: -0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "You don't have to push past how hard this feels right now; it's okay to just be here with it for a bit.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: 0.02,
    padDominance: -0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "If this is stirring up a lot, we can slow everything down and take it one tiny piece at a time.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.09,
    padArousal: 0.04,
    padDominance: -0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "You’re not weak for feeling this way; you’re responding like a human to something that really hurts.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.06,
    padDominance: 0.00
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "If you need to pause or change direction, that’s completely valid; we can stay close to what feels most manageable.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.03,
    padDominance: -0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "You’re not carrying this alone in this moment; I’m right here with you while you sort through it.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.05,
    padDominance: 0.00
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "It’s completely okay if all you can do right now is name what hurts without trying to fix it.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.09,
    padArousal: 0.03,
    padDominance: -0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "Nothing about this reaction makes you too much; it just shows how much this has mattered to you.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.06,
    padDominance: 0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "If it helps, we can put the intense parts at a bit of distance and focus on really small, gentle steps from here.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.04,
    padDominance: -0.03
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "You deserve some softness around this, not more pressure; we can treat this as something tender that needs care.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.05,
    padDominance: 0.00
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.comfort emotional_outcomes.comfort batch import...');

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

      const tags = ['ltlm', 'expressive.comfort', 'emotional_outcomes.comfort'];
      const source = 'ltlmbrief.expressive.comfort.emotional_outcomes.comfort';
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
    console.log('LTLM expressive.comfort emotional_outcomes.comfort batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.comfort emotional_outcomes.comfort batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.comfort emotional_outcomes.comfort batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.comfort emotional_outcomes.comfort batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
