import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.increase_autonomy';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you can treat everything we discuss here as an invitation, not an order; it is your call which pieces you actually try.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.08,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'When you look at your options, you are allowed to choose the one that fits your limits and values best, even if it is not the most “efficient” on paper.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.08,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, before taking a step, you might pause and ask, “Is this what I actually want to do?” and let that answer guide your next move.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.09,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You do not have to follow anyone else’s script here; you can adjust the plan so it works with your energy, not against it.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.08,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it is okay to say no to strategies that grate on you, even if they are popular; you get to choose tools that respect how you actually work.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.08,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'As you plan this, try to keep one question in view: “What would make this feel more like something I chose, rather than something happening to me?”',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.09,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if advice conflicts with your sense of what is safe or right for you, you are allowed to treat that advice as optional and adjust it.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.08,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You can choose a version of this task that is smaller or kinder than what you were first handed and still count it as real, legitimate action.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.08,
    padDominance: 0.17
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, when you notice yourself thinking “I have to…”, you might gently translate it to “I am choosing to…” or “I am allowed to…” and see how that shifts things.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.09,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You are not required to move faster than feels sustainable; setting your own pace here is a valid and important decision you get to make.',
    dialogueFunctionCode: 'task_management.instruct',
    speechActCode: 'directive.instruct',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.08,
    padDominance: 0.17
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM task_management.instruct + behavioral_outcomes.increase_autonomy batch import...');

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

      const tags = ['ltlm', 'task_management.instruct', 'directive.instruct', 'behavioral_outcomes.increase_autonomy'];
      const source = 'ltlmbrief.directive.instruct.task_management.instruct.behavioral_outcomes.increase_autonomy';
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
    console.log('LTLM task_management.instruct + behavioral_outcomes.increase_autonomy batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM task_management.instruct + behavioral_outcomes.increase_autonomy batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM task_management.instruct + behavioral_outcomes.increase_autonomy batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM task_management.instruct + behavioral_outcomes.increase_autonomy batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
