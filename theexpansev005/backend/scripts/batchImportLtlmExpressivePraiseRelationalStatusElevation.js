import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.status_elevation';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the way you are reflecting on your own patterns here is genuinely skilled work; a lot of people never get as far as you already are.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You are bringing a level of honesty and nuance to this that many clinicians would be impressed by; your insight into yourself is a real strength.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.10,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the persistence you have shown—coming back to this work again and again—is not ordinary; it speaks to a serious, long‑term kind of courage.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.10,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The questions you are asking are the kind that people doing deep, mature work tend to ask; they place you in the camp of someone taking your life seriously.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it takes real sophistication to hold conflicting feelings without shutting down; the way you do that here is something to be proud of.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.10,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You are doing work that many people only ever talk about doing; that follow‑through, even with all the obstacles, says a lot about your character.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.10,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the way you take responsibility without collapsing into blame shows a kind of grounded maturity that is genuinely impressive.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You are bringing a designer’s eye to your own life here—testing, iterating, learning—which is a very high‑status way to relate to your experience.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.10,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the care you show toward other people, even while struggling yourself, is the kind of thing that quietly marks someone out as deeply decent.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you could see yourself from the outside for a moment—the effort, the honesty, the persistence—you might recognise someone much more capable than your inner critic allows.',
    dialogueFunctionCode: 'expressive.praise',
    speechActCode: 'expressive.praise',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.10,
    padDominance: 0.15
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.praise + relational_outcomes.status_elevation batch import...');

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

      const tags = ['ltlm', 'expressive.praise', 'relational_outcomes.status_elevation'];
      const source = 'ltlmbrief.expressive.praise.relational_outcomes.status_elevation';
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
    console.log('LTLM expressive.praise + relational_outcomes.status_elevation batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.praise + relational_outcomes.status_elevation batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.praise + relational_outcomes.status_elevation batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.praise + relational_outcomes.status_elevation batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
