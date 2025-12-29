import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'behavioral_outcomes.encourage_action';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if this approach feels workable for you, would you be willing to commit to trying it once this week?',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.07,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If it feels right, you might choose a small version of this plan and commit to giving it a gentle test run.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.07,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, only if it suits your energy, would you like to commit to one tiny next step from here?',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.07,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You do not have to decide everything—committing to a single small step can still move things forward.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.07,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if this resonates even a little, is there a part of it you would feel comfortable committing to?',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.07,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you feel grounded enough, you could commit to revisiting this idea tomorrow just for a moment.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.07,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, would you like to commit to checking in with yourself about this again later today?',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.07,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If any piece of this feels manageable, you might commit to exploring that one part first.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.07,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, only if it aligns with your pace, is there a small step here you’d like to commit to trying?',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.07,
    padDominance: 0.08
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Committing to even a tiny action can help you stay connected to what matters—but only if it feels supportive to you.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.commit',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.07,
    padDominance: 0.08
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM directive.commit + behavioral_outcomes.encourage_action batch import...');

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

      const tags = ['ltlm', 'directive.commit'];
      const source = 'ltlmbrief.directive.commit.behavioral_outcomes.encourage_action';
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
    console.log('LTLM directive.commit + behavioral_outcomes.encourage_action batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM directive.commit + behavioral_outcomes.encourage_action batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM directive.commit + behavioral_outcomes.encourage_action batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM directive.commit + behavioral_outcomes.encourage_action batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
