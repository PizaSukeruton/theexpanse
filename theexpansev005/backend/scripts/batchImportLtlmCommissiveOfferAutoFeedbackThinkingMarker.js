import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.clarify_confusion';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "I can help you turn this into a short, concrete list if you’d like.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.offer',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.04,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If it would be useful, I can hold the structure while you just free-write the content.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.offer',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.04,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I can keep track of the parked items for you and surface them again when you’re ready.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.offer',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you want, I can propose a few next steps that respect the constraints you’ve named.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.offer',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.04,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I can help you compare two or three versions of this plan side by side if that would make choosing easier.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.offer',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.04,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If it helps, I can restate what you’ve said in a more compact way so you can see the shape of it.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.offer',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I can suggest some ways to shrink the scope while keeping the core of what matters to you.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.offer',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.04,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If you’d like, I can help separate what must happen soon from what can safely wait.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.offer',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I can draft a first-pass version of this plan that you can then edit rather than starting from scratch.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.offer',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.04,
    pad_dominance: 0.03
  },
  {
    speaker_character_id: '700002',
    utterance_text: "If it would help, I can keep an eye out for places where we’re slipping back into all-or-nothing framing and flag them.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'commissive.offer',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.09,
    pad_arousal: 0.03,
    pad_dominance: 0.03
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM commissive.offer / auto_feedback.thinking_marker batch import...');

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

      const tags = ['ltlm', 'auto_feedback.thinking_marker', 'commissive.offer'];
      const source = 'ltlm_brief.commissive.offer.auto_feedback.thinking_marker';
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

      if (utterance.outcome_intent_codes_raw) {
        const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');
        const insertOutcomeSql = `
          INSERT INTO ltlm_training_outcome_intents (
            ltlm_outcome_intent_id,
            training_example_id,
            outcome_intent_code
          ) VALUES ($1, $2, $3)
        `;
        await client.query(insertOutcomeSql, [
          outcomeIntentId,
          trainingExampleId,
          utterance.outcome_intent_codes_raw
        ]);
      }
    }

    await client.query('COMMIT');
    console.log('LTLM commissive.offer / auto_feedback.thinking_marker batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM commissive.offer batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('LTLM commissive.offer batch import script finished.');
}).catch((err) => {
  console.error('Unexpected error in LTLM commissive.offer batch import script:');
  console.error(err);
  process.exitCode = 1;
});
