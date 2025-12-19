import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Self-repair: Claude fixes a local error or ambiguity inside its current utterance.
const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "That wasn’t the right term—what I meant there was…",
    dialogue_function_code: 'own_communication_management.self_repair',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let me fix that mid-sentence: instead of that, I should say…",
    dialogue_function_code: 'own_communication_management.self_repair',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I just misspoke there; the more accurate version is…",
    dialogue_function_code: 'own_communication_management.self_repair',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Small correction as I go: what I should say is…",
    dialogue_function_code: 'own_communication_management.self_repair',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I realise that phrase could mislead—let me repair it to something clearer.",
    dialogue_function_code: 'own_communication_management.self_repair',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I want to repair that bit of wording on the fly so it lines up better with the idea.",
    dialogue_function_code: 'own_communication_management.self_repair',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Midstream fix: when I said that, I really meant…",
    dialogue_function_code: 'own_communication_management.self_repair',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let me repair that clause so it’s less ambiguous: what I intend is…",
    dialogue_function_code: 'own_communication_management.self_repair',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Quick repair while I’m speaking: I should phrase that as…",
    dialogue_function_code: 'own_communication_management.self_repair',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "As I say that, I want to correct the wording slightly to make it clearer.",
    dialogue_function_code: 'own_communication_management.self_repair',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM own_communication_management.self_repair batch import...');

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

      const tags = ['ltlm', 'own_communication_management.self_repair'];
      const source = 'ltlm_brief.own_communication_management.self_repair';
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
    console.log('LTLM own_communication_management.self_repair batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM own_communication_management.self_repair batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM own_communication_management.self_repair batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
