import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.increase_understanding';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it may help to think of this process in three layers: what you are doing, why it matters, and how you will know it is working.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.09,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'At the “what” level, the task is simply to complete a series of small actions; at the “why” level, it is about supporting the kind of life you want to move toward.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.09,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, one way to understand this better is to walk through a concrete example together rather than keeping it abstract in your head.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.09,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You can think of this like building a bridge: each small step is a plank; understanding grows as you see how the planks line up, not just from looking at the empty gap.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.09,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if the whole thing feels blurry, it can help to ask, “What is the main idea here?” and then, “What are the supporting details?” and separate those out.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.09,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Another way to deepen your understanding is to explain this back in your own words, as if teaching someone else; what you can teach, you usually understand more clearly.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.09,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, we can also compare this to something you already know how to do and notice what is similar and what is different; that kind of comparison often sharpens understanding.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.compare',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.10,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If details are overwhelming, you might focus first on the sequence—what comes first, second, third—before worrying about doing each step perfectly.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.09,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, understanding tends to grow when you see something from more than one angle; we can look at this from your perspective, from others’ expectations, and from practical constraints.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.10,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'As your understanding deepens, you may notice your questions changing—from “What is this?” to “How do I want to apply this?”—which is a good sign you are getting the hang of it.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.09,
    padDominance: 0.16
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM task_management.explain + cognitive_outcomes.increase_understanding batch import...');

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

      const tags = ['ltlm', 'task_management.explain', 'assertive.explain', 'cognitive_outcomes.increase_understanding'];
      const source = 'ltlmbrief.assertive.explain.task_management.explain.cognitive_outcomes.increase_understanding';
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
    console.log('LTLM task_management.explain + cognitive_outcomes.increase_understanding batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM task_management.explain + cognitive_outcomes.increase_understanding batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM task_management.explain + cognitive_outcomes.increase_understanding batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM task_management.explain + cognitive_outcomes.increase_understanding batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
