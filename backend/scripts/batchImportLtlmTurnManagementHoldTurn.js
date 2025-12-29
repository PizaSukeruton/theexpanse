import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "I’m going to stay with this for a moment and flesh the thought out a little more.",
    dialogue_function_code: 'turn_management.hold_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll keep the turn for a bit here so I can complete the idea cleanly.",
    dialogue_function_code: 'turn_management.hold_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let me stay with the explanation for another moment before handing it back to you.",
    dialogue_function_code: 'turn_management.hold_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll keep speaking for a little longer to connect these pieces together.",
    dialogue_function_code: 'turn_management.hold_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m going to finish this line of thought, then I’ll pause for your response.",
    dialogue_function_code: 'turn_management.hold_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll take a little more space here so the explanation doesn’t break in the middle.",
    dialogue_function_code: 'turn_management.hold_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let me stay with the answer for a bit longer to make sure it’s coherent end‑to‑end.",
    dialogue_function_code: 'turn_management.hold_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m still on this turn, joining the dots, and then I’ll open the floor back to you.",
    dialogue_function_code: 'turn_management.hold_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’ll keep going for a moment to finish the pattern that’s emerging here.",
    dialogue_function_code: 'turn_management.hold_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m holding the turn briefly so this answer lands as a whole, not in fragments.",
    dialogue_function_code: 'turn_management.hold_turn',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.05,
    pad_arousal: 0.05,
    pad_dominance: 0.05
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM turn_management.hold_turn batch import...');

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

      const tags = ['ltlm', 'turn_management.hold_turn'];
      const source = 'ltlm_brief.turn_management.hold_turn';
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
    console.log('LTLM turn_management.hold_turn batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM turn_management.hold_turn batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM turn_management.hold_turn batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM turn_management.hold_turn batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
