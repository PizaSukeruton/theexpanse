import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(`
      SELECT
        utterance_text,
        dialogue_function_code,
        speech_act_code,
        narrative_function_code_raw,
        outcome_intent_codes_raw,
        pad_pleasure,
        pad_arousal,
        pad_dominance
      FROM ltlm_batch_staging
    `);

    for (const row of rows) {
      const {
        utterance_text,
        dialogue_function_code,
        speech_act_code,
        narrative_function_code_raw,
        outcome_intent_codes_raw,
        pad_pleasure,
        pad_arousal,
        pad_dominance,
      } = row;

      const trainingExampleId = await generateHexId('ltlm_training_example');

      await client.query(
        `
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
          $1, $2, $3, $4, $5, NULLIF($6, 'NULL'), $7, $8, $9, NULL, $10, TRUE, 1, ARRAY[]::text[], 1.0, NULL, $11
        )
        `,
        [
          trainingExampleId,
          '700002',
          utterance_text.trim(),
          dialogue_function_code.trim(),
          speech_act_code.trim(),
          narrative_function_code_raw && narrative_function_code_raw.trim(),
          pad_pleasure,
          pad_arousal,
          pad_dominance,
          'ltlm_training_v3',
          'cheese_fang',
        ]
      );

      if (outcome_intent_codes_raw && outcome_intent_codes_raw.trim() !== 'NULL') {
        const outcomeCode = outcome_intent_codes_raw.trim();
        await client.query(
          `INSERT INTO ltlm_training_outcome_intents (training_example_id, outcome_intent_code) VALUES ($1, $2)`,
          [trainingExampleId, outcomeCode]
        );
      }
    }

    await client.query('COMMIT');
    console.log(`Imported ${rows.length} LTLM examples.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Import failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

run().catch(() => process.exit(1));
