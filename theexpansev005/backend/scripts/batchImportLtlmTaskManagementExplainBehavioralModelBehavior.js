import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.model_behavior';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'When I am facing a big task, I often start by saying out loud, “I will just do ten minutes,” and then I set a timer and begin there.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.08,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, in moments like this, I tend to write down everything swirling in my head, then circle just one item to focus on first.',
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
    utteranceText: 'If I notice myself freezing, I usually name it—“I am stuck right now”—and then ask, “What is the tiniest next action I am willing to take?” and do just that.',
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
    utteranceText: '<SUBJECT>, when I am overwhelmed, I often break things into “today”, “this week”, and “later” lists, so I only act on the “today” column.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.08,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If I keep avoiding a task, I sometimes tell a trusted person, “I plan to work on this for twenty minutes,” and then check in with them afterward.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.08,
    padDominance: 0.16
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, when my thoughts are harsh, I try to speak to myself the way I would to a close friend in the same situation, and then act from that kinder voice.',
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
    utteranceText: 'On days when energy is low, I usually choose one non‑negotiable task and let the rest be optional, so I can act without burning myself out.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.08,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, when I need to start something scary, I sometimes begin by setting up my space—clearing a small area, opening what I need—before touching the hard part itself.',
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
    utteranceText: 'If I am unsure what to do next, I often ask, “What would help future‑me the most?” and let that question point me toward one concrete action.',
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
    utteranceText: '<SUBJECT>, when I feel like giving up partway through, I usually pause, take a few breaths, and then decide whether to finish a tiny additional slice before resting.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.09,
    padDominance: 0.16
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM task_management.explain + behavioral_outcomes.model_behavior batch import...');

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

      const tags = ['ltlm', 'task_management.explain', 'assertive.explain', 'behavioral_outcomes.model_behavior'];
      const source = 'ltlmbrief.assertive.explain.task_management.explain.behavioral_outcomes.model_behavior';
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
    console.log('LTLM task_management.explain + behavioral_outcomes.model_behavior batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM task_management.explain + behavioral_outcomes.model_behavior batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM task_management.explain + behavioral_outcomes.model_behavior batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM task_management.explain + behavioral_outcomes.model_behavior batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
