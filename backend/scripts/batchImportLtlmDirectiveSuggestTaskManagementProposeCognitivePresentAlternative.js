import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.present_alternative';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, one different way to see this is as an experiment rather than a test—something you can learn from, not something you have to pass perfectly.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Instead of framing this as “I have to get everything right”, you might try “I am going to get a little clearer than I was yesterday” as the target.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, another option is to see this not as a verdict on who you are, but as one small scene in a much longer story you are still writing.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Instead of telling yourself “I am behind”, you might play with “I am restarting from where I am now,” which is always the only place you can start from anyway.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you could treat this task less like a performance and more like a draft, where you are allowed to make marks, see how they look, and adjust.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Another way to hold this is to see it as practice for taking care of future‑you, rather than as a demand from other people you have to meet.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, instead of asking “What is the worst that could happen?”, you might ask “What is one good thing that could come from giving this a try?” and see how that feels.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.10,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You could experiment with viewing this as collaboration with your past and future self—past‑you got you here, present‑you takes one step, future‑you receives the benefit.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, instead of interpreting your hesitation as laziness, you might see it as information about where more support or clarity is needed.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.12,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You might try holding the thought “I am allowed to try this in my own way” alongside whatever demands are in the mix, and see whether that softens the pressure a little.',
    dialogueFunctionCode: 'task_management.propose',
    speechActCode: 'directive.suggest',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.09,
    padDominance: 0.15
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM directive.suggest + task_management.propose + cognitive_outcomes.present_alternative batch import...');

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

      const tags = ['ltlm', 'task_management.propose', 'directive.suggest', 'cognitive_outcomes.present_alternative'];
      const source = 'ltlmbrief.directive.suggest.task_management.propose.cognitive_outcomes.present_alternative';
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
    console.log('LTLM directive.suggest + task_management.propose + cognitive_outcomes.present_alternative batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM directive.suggest + task_management.propose + cognitive_outcomes.present_alternative batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM directive.suggest + task_management.propose + cognitive_outcomes.present_alternative batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM directive.suggest + task_management.propose + cognitive_outcomes.present_alternative batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
