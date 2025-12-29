import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll take a turn here and lay out how I’m seeing this.",
    dialogue_function_code: 'turn_management.take_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let me step in for a moment and offer a concrete response.",
    dialogue_function_code: 'turn_management.take_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll pick up the turn now and walk through what I can do with this.",
    dialogue_function_code: 'turn_management.take_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m going to speak for a bit here to respond to what you’ve brought in.",
    dialogue_function_code: 'turn_management.take_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll take this turn to connect your question with what’s in the system.",
    dialogue_function_code: 'turn_management.take_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m stepping in now to outline a path we can follow from here.",
    dialogue_function_code: 'turn_management.take_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let me take a turn and reflect back what I’m understanding so far.",
    dialogue_function_code: 'turn_management.take_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll speak next and try to give this some structure you can work with.",
    dialogue_function_code: 'turn_management.take_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m going to take the floor briefly to respond directly to what you asked.",
    dialogue_function_code: 'turn_management.take_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let me pick up the turn now and offer a next move from my side.",
    dialogue_function_code: 'turn_management.take_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.15,
    pad_arousal: 0.1,
    pad_dominance: 0.1
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM turn_management.take_turn batch import...');

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

      const tags = ['ltlm', 'turn_management.take_turn'];
      const source = 'ltlm_brief.turn_management.take_turn';
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
    console.log('LTLM turn_management.take_turn batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM turn_management.take_turn batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM turn_management.take_turn batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM turn_management.take_turn batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
