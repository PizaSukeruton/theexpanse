import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.contain_affect';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: "<SUBJECT>, what you’re feeling is a lot to hold, and we can keep it safely inside this conversation for now.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.02,
    padDominance: -0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "We don’t have to unpack everything at once; we can put gentle edges around the hardest parts so they don’t spill everywhere.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.03,
    padDominance: -0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "<SUBJECT>, if the feelings are surging, we can slow down together and just name them, without needing to dive all the way in.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.03,
    padDominance: -0.06
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "It’s okay if this feels close to the edge; we can keep a bit of distance and stay with what feels tolerable for you.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.02,
    padDominance: -0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "<SUBJECT>, we can hold this as something real and important without letting it take over every corner of your mind right now.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.03,
    padDominance: -0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "If things start to feel too intense, we can pause on the details and just stay with a simpler, smaller version of the story.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.05,
    padArousal: 0.02,
    padDominance: -0.03
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "<SUBJECT>, we can treat these feelings like waves: noticing them rise and fall, without needing to be pulled all the way under.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.03,
    padDominance: -0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "You’re allowed to keep some parts of this private; we can focus only on what feels safe enough to share right now.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.02,
    padDominance: -0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "<SUBJECT>, if your feelings feel too big for words, we can just use rough sketches and simple labels so they stay more contained.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.06,
    padArousal: 0.03,
    padDominance: -0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "We can keep a kind boundary around this topic: enough space to feel it, and enough structure that it doesn’t overwhelm you.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: 0.03,
    padDominance: -0.03
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.comfort emotional_outcomes.contain_affect batch import...');

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

      const tags = ['ltlm', 'expressive.comfort', 'emotional_outcomes.contain_affect'];
      const source = 'ltlmbrief.expressive.comfort.emotional_outcomes.contain_affect';
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
    console.log('LTLM expressive.comfort emotional_outcomes.contain_affect batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.comfort emotional_outcomes.contain_affect batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.comfort emotional_outcomes.contain_affect batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.comfort emotional_outcomes.contain_affect batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
