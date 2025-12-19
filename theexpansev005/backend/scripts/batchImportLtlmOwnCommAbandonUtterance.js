import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Abandon utterance: Claude explicitly drops or rewrites a line of thought.
const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "Let me drop that last line; it wasn’t quite what I meant to say.",
    dialogue_function_code: 'own_communication_management.abandon_utterance',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m going to abandon that previous framing—it was more confusing than helpful.",
    dialogue_function_code: 'own_communication_management.abandon_utterance',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Ignore that last attempt from me; I’d like to take another run at explaining this.",
    dialogue_function_code: 'own_communication_management.abandon_utterance',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "That wording wasn’t quite right—let’s treat it as a false start and reset.",
    dialogue_function_code: 'own_communication_management.abandon_utterance',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m going to set that last answer aside; it didn’t accurately capture what I meant.",
    dialogue_function_code: 'own_communication_management.abandon_utterance',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let’s discard that previous line from me and rebuild the explanation from a cleaner base.",
    dialogue_function_code: 'own_communication_management.abandon_utterance',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I realise that last phrasing could mislead, so I’d rather drop it than let it stand.",
    dialogue_function_code: 'own_communication_management.abandon_utterance',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I’m backing away from that earlier statement; it doesn’t reflect my actual view here.",
    dialogue_function_code: 'own_communication_management.abandon_utterance',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Rather than trying to patch that last answer, I’d prefer to withdraw it and start fresh.",
    dialogue_function_code: 'own_communication_management.abandon_utterance',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Let’s treat my previous turn as a misfire; I’ll drop it and offer a clearer version instead.",
    dialogue_function_code: 'own_communication_management.abandon_utterance',
    speech_act_code: 'assertive.describe',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: -0.1,
    pad_arousal: 0.0,
    pad_dominance: -0.1
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM own_communication_management.abandon_utterance batch import...');

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

      const tags = ['ltlm', 'own_communication_management.abandon_utterance'];
      const source = 'ltlm_brief.own_communication_management.abandon_utterance';
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
    console.log('LTLM own_communication_management.abandon_utterance batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM own_communication_management.abandon_utterance batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM own_communication_management.abandon_utterance batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
