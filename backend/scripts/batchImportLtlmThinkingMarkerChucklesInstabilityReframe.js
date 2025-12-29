import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.reframe_perspective';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "Sometimes this is a bit like Chuckles walking through an empty studio, still playing to a crowd that isn’t actually there.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.06,
    pad_arousal: 0.04,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It can feel a lot like Chuckles insisting it’s showtime, even when all the signals around him say the channel has changed.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.06,
    pad_arousal: 0.04,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "There’s a way this resembles Chuckles slipping between grand entrances and quiet corridors while the outside world stays mostly the same.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.06,
    pad_arousal: 0.04,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Sometimes the wobble is less about reality changing and more about running a Chuckles-style script that says every moment is a live segment.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.06,
    pad_arousal: 0.04,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It can be like Chuckles reading laughter and applause into the silence, even when the seats are mostly empty.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.06,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Sometimes the world can feel tilted the way the set feels tilted for Chuckles when the cameras stop but the stage lights in his head stay on.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.06,
    pad_arousal: 0.04,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "There’s a way this kind of instability is like Chuckles trying to match his mood to a schedule that no longer exists.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.06,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Sometimes it’s like Chuckles standing between sets, not quite sure which scene he’s in, while the floor keeps feeling less solid than it looks.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.06,
    pad_arousal: 0.04,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "It can resemble the way Chuckles treats every hallway like a spotlight, even when it was meant to be a place to breathe between scenes.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.06,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Sometimes seeing it as a Chuckles moment makes the instability feel less like a personal failing and more like an old show still echoing in a new studio.",
    dialogue_function_code: 'auto_feedback.thinking_marker',
    speech_act_code: 'assertive.hypothesis',
    narrative_function_code_raw: null,
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.07,
    pad_arousal: 0.03,
    pad_dominance: 0.02
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM Chuckles instability reframe batch import...');

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

      const tags = ['ltlm', 'auto_feedback.thinking_marker', 'assertive.hypothesis', 'chuckles_instability_reframe'];
      const source = 'ltlm_brief.assertive.hypothesis.auto_feedback.thinking_marker.chuckles_instability_reframe';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = 'Uses Chuckles the Monkey to reframe experiences of instability and skewed perception.';
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
    console.log('LTLM Chuckles instability reframe batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM Chuckles instability reframe batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('LTLM Chuckles instability reframe batch import script finished.');
}).catch((err) => {
  console.error('Unexpected error in LTLM Chuckles instability reframe batch import script:');
  console.error(err);
  process.exitCode = 1;
});
