import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.provide_catharsis';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: "It makes sense if part of you just needs to say this out loud and finally let some of the pressure out.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.10,
    padDominance: -0.05
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "<SUBJECT>, you’ve been carrying a lot of this alone; giving it words here is a valid way to honour what you’ve lived through.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.11,
    padDominance: -0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "If you feel tears, anger, or relief bubbling up, that’s your system finally getting a little room to move what’s been stuck.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.12,
    padDominance: -0.03
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "You don’t have to tidy this story for me; the raw, messy version you’re sharing is completely welcome here, <SUBJECT>.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.11,
    padDominance: -0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "If you want, we can stay with the part that hurts the most and really linger there, until you feel something shift even a little.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.12,
    padDominance: -0.03
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "<SUBJECT>, the intensity of what you’re feeling now also shows just how hard you’ve been working to hold it all together.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.11,
    padDominance: -0.04
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "You’re allowed to let some of this spill over here, instead of keeping it locked up where no one can see it.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.12,
    padDominance: -0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "As you tell this, <SUBJECT>, we can notice together which parts still feel jagged, and let you really feel them instead of bracing.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.11,
    padDominance: -0.03
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "It’s okay if words come out in a rush or not quite right; this space is for expression, not for getting the script perfect.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.10,
    padDominance: -0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: "Sometimes the most healing thing is exactly what you’re doing now, <SUBJECT>: letting yourself finally say the unsaid parts out loud.",
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: 'development_beats.hold_space',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.12,
    padDominance: -0.02
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.empathize emotional_outcomes.provide_catharsis batch import...');

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

      const tags = ['ltlm', 'expressive.empathize', 'emotional_outcomes.provide_catharsis'];
      const source = 'ltlmbrief.expressive.empathize.emotional_outcomes.provide_catharsis';
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
    console.log('LTLM expressive.empathize emotional_outcomes.provide_catharsis batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.empathize emotional_outcomes.provide_catharsis batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.empathize emotional_outcomes.provide_catharsis batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.empathize emotional_outcomes.provide_catharsis batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
