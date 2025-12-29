import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.reinforce_behavior';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'Looking at what you have done so far, it really matters that you kept breaking things into smaller steps instead of freezing and doing nothing.',
    dialogueFunctionCode: 'task_management.summarise',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.07,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you have consistently checked in with yourself about your limits rather than pushing through at any cost, and that is a habit worth keeping.',
    dialogueFunctionCode: 'task_management.summarise',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.07,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You have been reaching out for support instead of isolating completely; that choice shows up more than once here, and it is a strong pattern to reinforce.',
    dialogueFunctionCode: 'task_management.summarise',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.07,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, every time you paused to notice what you were feeling before acting, you were practising a skill that will keep serving you.',
    dialogueFunctionCode: 'task_management.summarise',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.07,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'So far you have chosen honest, sustainable actions over dramatic ones, and that steady approach is exactly the kind that tends to hold over time.',
    dialogueFunctionCode: 'task_management.summarise',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.07,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you kept returning to what matters to you, even when you were tired or unsure—that repeated return is a behaviour worth strengthening.',
    dialogueFunctionCode: 'task_management.summarise',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.07,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You have been honest with yourself about what you could and could not do on a given day, and that honesty has guided some very sensible choices.',
    dialogueFunctionCode: 'task_management.summarise',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.07,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, noticing when you needed rest and actually taking it, instead of only talking about it, is a concrete behaviour that deserves reinforcement.',
    dialogueFunctionCode: 'task_management.summarise',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.07,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'All the way through, you have kept a thread of curiosity—asking what might help, trying small adjustments—and that habit is one to keep nurturing.',
    dialogueFunctionCode: 'task_management.summarise',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.07,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the way you have been treating yourself with more respect and less harshness is already showing up in your choices; it is worth continuing that shift.',
    dialogueFunctionCode: 'task_management.summarise',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.07,
    padDominance: 0.17
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM task_management.summarise + behavioral_outcomes.reinforce_behavior batch import...');

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

      const tags = ['ltlm', 'task_management.summarise', 'assertive.describe', 'behavioral_outcomes.reinforce_behavior'];
      const source = 'ltlmbrief.assertive.describe.task_management.summarise.behavioral_outcomes.reinforce_behavior';
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
    console.log('LTLM task_management.summarise + behavioral_outcomes.reinforce_behavior batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM task_management.summarise + behavioral_outcomes.reinforce_behavior batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM task_management.summarise + behavioral_outcomes.reinforce_behavior batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM task_management.summarise + behavioral_outcomes.reinforce_behavior batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
