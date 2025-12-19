import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "One option is that we start by stabilising the current state, then layer improvements on top.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.15,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We could also invert that and tackle the highest‑impact improvement first, then stabilise around it.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.15,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you want a lighter lift, we can begin with a small, reversible change and observe the effects.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.15,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Another path is to document the ideal end state first, then work backwards to define the steps.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.15,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We can split this into a fast, minimal version now and a more complete pass once the basics are stable.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.15,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you prefer structure, I can propose a checklist you work through while I keep track of context.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.15,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We might also batch similar subtasks together so you stay in the same mental mode for longer.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.15,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Another proposal is to time‑box an initial pass, accept a rough version, and refine only what matters most.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.15,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "We can also identify one safeguard for this task so that mistakes are easy to detect and unwind.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.15,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you like, I can propose a default plan and you can adjust it to match your energy and constraints today.",
    dialogue_function_code: 'task_management.propose',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.15,
    pad_dominance: 0.1
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM task_management.propose batch import...');

    await client.query('BEGIN');

    for (const utterance of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');

      const narrativeFunctionCode = utterance.narrative_function_code_raw || null;
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
        ) VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
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

      const tags = ['ltlm', 'task_management.propose'];
      const source = 'ltlm_brief.task_management.propose';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = null;
      const createdBy = '700002';

      await client.query(insertExampleSql, [
        trainingExampleId,
        utterance.speaker_character_id,
        utterance.utterance_text,
        utterance.dialogue_function_code,
        utterance.speech_act_code,
        narrativeFunctionCode,
        utterance.pad_pleasure,
        utterance.pad_arousal,
        utterance.pad_dominance,
        emotionRegisterId,
        source,
        isCanonical,
        difficulty,
        tags,
        categoryConfidence,
        notes,
        createdBy
      ]);

      console.log(`Inserted ltlm_training_examples row ${trainingExampleId}`);

      if (utterance.outcome_intent_codes_raw) {
        const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');

        const insertOutcomeSql = `
          INSERT INTO ltlm_training_outcome_intents (
            ltlm_outcome_intent_id,
            training_example_id,
            outcome_intent_code
          ) VALUES (
            $1,
            $2,
            $3
          )
        `;

        await client.query(insertOutcomeSql, [
          outcomeIntentId,
          trainingExampleId,
          utterance.outcome_intent_codes_raw
        ]);

        console.log(
          `Inserted ltlm_training_outcome_intents row ${outcomeIntentId} for training_example_id ${trainingExampleId}`
        );
      } else {
        console.log(
          `No outcome_intent_codes_raw for training_example_id ${trainingExampleId}; skipping outcome intents`
        );
      }
    }

    await client.query('COMMIT');
    console.log('LTLM task_management.propose batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM task_management.propose batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM task_management.propose batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
