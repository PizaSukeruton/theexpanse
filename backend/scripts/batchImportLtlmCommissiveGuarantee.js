import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.maintain_trust';

const utterances = [
  {
    speaker_character_id: '700002',
    utterance_text: "You have my word on this, <SUBJECT>: I will remember this and follow through exactly as promised.",
    dialogue_function_code: 'commissive.guarantee',
    speech_act_code: 'directive.commit',
    narrative_function_code_raw: 'development_beats.stabilise',
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: -0.1,
    pad_dominance: 0.2
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I will not drop this thread, <SUBJECT>; what you have shared will be kept safe and honoured.",
    dialogue_function_code: 'commissive.guarantee',
    speech_act_code: 'directive.commit',
    narrative_function_code_raw: 'development_beats.stabilise',
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: -0.1,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "Consider this a binding commitment from me, <SUBJECT>: I will act on the next step you requested when you return.",
    dialogue_function_code: 'commissive.guarantee',
    speech_act_code: 'directive.commit',
    narrative_function_code_raw: 'development_beats.advance',
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: 0.0,
    pad_dominance: 0.2
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I guarantee that your preferences here will guide my future answers, <SUBJECT>, unless you explicitly change them.",
    dialogue_function_code: 'commissive.guarantee',
    speech_act_code: 'directive.commit',
    narrative_function_code_raw: 'development_beats.stabilise',
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: -0.1,
    pad_dominance: 0.2
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This path will not be closed off without your consent, <SUBJECT>; I commit to preserving it as an available option.",
    dialogue_function_code: 'commissive.guarantee',
    speech_act_code: 'directive.commit',
    narrative_function_code_raw: 'development_beats.stabilise',
    outcome_intent_codes_raw: 'cognitive_outcomes.reduce_anxiety',
    pad_pleasure: 0.1,
    pad_arousal: -0.2,
    pad_dominance: 0.2
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I will track this decision carefully, <SUBJECT>, and I will not quietly overwrite it with a conflicting choice.",
    dialogue_function_code: 'commissive.guarantee',
    speech_act_code: 'directive.commit',
    narrative_function_code_raw: 'development_beats.stabilise',
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: -0.1,
    pad_dominance: 0.2
  },
  {
    speaker_character_id: '700002',
    utterance_text: "You can rely on this safeguard staying in place, <SUBJECT>; I will only adjust it if you clearly ask for a change.",
    dialogue_function_code: 'commissive.guarantee',
    speech_act_code: 'directive.commit',
    narrative_function_code_raw: 'development_beats.stabilise',
    outcome_intent_codes_raw: 'cognitive_outcomes.reduce_anxiety',
    pad_pleasure: 0.1,
    pad_arousal: -0.2,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I commit to surfacing this context whenever it becomes relevant again, <SUBJECT>, rather than letting it fade.",
    dialogue_function_code: 'commissive.guarantee',
    speech_act_code: 'directive.commit',
    narrative_function_code_raw: 'development_beats.deepen',
    outcome_intent_codes_raw: 'cognitive_outcomes.increase_understanding',
    pad_pleasure: 0.1,
    pad_arousal: 0.0,
    pad_dominance: 0.1
  },
  {
    speaker_character_id: '700002',
    utterance_text: "This constraint will remain active for our work together, <SUBJECT>; I will not relax it on a whim or for convenience.",
    dialogue_function_code: 'commissive.guarantee',
    speech_act_code: 'directive.commit',
    narrative_function_code_raw: 'development_beats.stabilise',
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.0,
    pad_arousal: -0.1,
    pad_dominance: 0.2
  },
  {
    speaker_character_id: '700002',
    utterance_text: "I promise to protect the spirit of what you decided here, <SUBJECT>, not just the exact words you used.",
    dialogue_function_code: 'commissive.guarantee',
    speech_act_code: 'directive.commit',
    narrative_function_code_raw: 'development_beats.deepen',
    outcome_intent_codes_raw: OUTCOME_INTENT_CODE,
    pad_pleasure: 0.2,
    pad_arousal: -0.1,
    pad_dominance: 0.1
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM commissive.guarantee batch import...');

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

      const tags = ['ltlm', 'commissive.guarantee'];
      const source = 'ltlm_brief.commissive.guarantee';
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

      console.log('Inserted ltlm_training_examples row ' + trainingExampleId);

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
          'Inserted ltlm_training_outcome_intents row ' +
          outcomeIntentId +
          ' for training_example_id ' +
          trainingExampleId
        );
      } else {
        console.log(
          'No outcome_intent_codes_raw for training_example_id ' +
          trainingExampleId +
          '; skipping outcome intents'
        );
      }
    }

    await client.query('COMMIT');
    console.log('LTLM commissive.guarantee batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM commissive.guarantee batch import failed; transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM commissive.guarantee batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM commissive.guarantee batch import script:');
    console.error(err);
    process.exitCode = 1;
  });
