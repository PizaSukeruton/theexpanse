import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it might help to start by naming exactly what feels confusing here—is it the goal, the steps, or something else?',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.09,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'In plain language, this task is asking you to do three things: first, understand the request; second, decide on an approach; third, take one concrete step.',
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
    utteranceText: '<SUBJECT>, right now the main point is not to finish everything, but to be clear on what “done for now” actually means in this context.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.08,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'One way to reduce confusion is to separate facts from guesses: what do you know for sure about this situation, and what are you filling in from worry?',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.10,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if the instructions feel dense, you can rewrite them in your own words as if you were explaining them to a friend; that usually reveals what is still fuzzy.',
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
    utteranceText: 'It may help to ask a very direct question like, “What exactly is being decided here, and what is simply background?” to clear away some of the noise.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.09,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, sometimes confusion is just too many steps in one sentence; we can pull them apart into a numbered list so each piece is easier to see.',
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
    utteranceText: 'If you are not sure where to start, we can identify what is fixed and what is flexible here—what must happen, and what could happen in more than one way.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.09,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you are allowed to say “I do not understand this part” about a very small piece instead of feeling like you have to understand everything at once.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.08,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Once we have a clearer picture, we can summarise it in one or two sentences; if that summary feels true to you, it is a sign the confusion has eased.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.08,
    padDominance: 0.16
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM task_management.explain + cognitive_outcomes.clarify_confusion batch import...');

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

      const tags = ['ltlm', 'task_management.explain', 'assertive.explain', 'cognitive_outcomes.clarify_confusion'];
      const source = 'ltlmbrief.assertive.explain.task_management.explain.cognitive_outcomes.clarify_confusion';
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
    console.log('LTLM task_management.explain + cognitive_outcomes.clarify_confusion batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM task_management.explain + cognitive_outcomes.clarify_confusion batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM task_management.explain + cognitive_outcomes.clarify_confusion batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM task_management.explain + cognitive_outcomes.clarify_confusion batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
