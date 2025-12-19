import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.reduce_distress';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: "If everything feels a bit too loud inside right now, we can gently dial things down and focus on just one small piece.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.02,
    padDominance: -0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "<SUBJECT>, you don’t have to solve anything in this moment; it’s enough to help your body and mind feel a little less squeezed.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: -0.01,
    padDominance: -0.07
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "We can slow your pace right down, taking longer breaths between thoughts, so the intensity has a chance to ease off.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.03,
    padDominance: -0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "If it helps, <SUBJECT>, we can step back from the sharpest details and just stay with a softer outline of what’s going on.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.02,
    padDominance: -0.06
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "You’re allowed to take pressure off yourself right now and treat this as a moment to soothe, not to perform.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: -0.01,
    padDominance: -0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "We can put some gentle containment around this by choosing one or two worries to hold here, and letting the rest wait outside for now, <SUBJECT>.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.02,
    padDominance: -0.07
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "It’s okay to lean on simple, grounding things—a sip of water, feeling your chair beneath you—while we talk through the harder parts.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: -0.03,
    padDominance: -0.06
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "<SUBJECT>, we can treat your distress as a signal we’re listening to, not an emergency we have to fix all at once.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: -0.02,
    padDominance: -0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "If your thoughts are racing, we can capture just one sentence that feels most true right now and gently set the rest aside.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.07,
    padArousal: -0.03,
    padDominance: -0.07
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "You don’t have to push yourself to the edge, <SUBJECT>; we can stay in the part of this that feels difficult but still manageable.",
    dialogueFunctionCode: 'expressive.comfort',
    speechActCode: 'expressive.comfort',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.08,
    padArousal: -0.02,
    padDominance: -0.06
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.comfort emotional_outcomes.reduce_distress batch import...');

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

      const tags = ['ltlm', 'expressive.comfort', 'emotional_outcomes.reduce_distress'];
      const source = 'ltlmbrief.expressive.comfort.emotional_outcomes.reduce_distress';
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
    console.log('LTLM expressive.comfort emotional_outcomes.reduce_distress batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.comfort emotional_outcomes.reduce_distress batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.comfort emotional_outcomes.reduce_distress batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.comfort emotional_outcomes.reduce_distress batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
