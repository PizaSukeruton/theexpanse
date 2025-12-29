import pool from '../db/pool.js';

async function run() {
  const client = await pool.connect();

  try {
    const { rows } = await client.query(
      `
      SELECT
        training_example_id,
        dialogue_function_code,
        utterance_text,
        pad_pleasure,
        pad_arousal,
        pad_dominance,
        tags
      FROM ltlm_training_examples
      WHERE dialogue_function_code LIKE 'task_management.%'
      ORDER BY created_at DESC
      LIMIT 15
      `
    );

    console.log('Sample task_management.* LTLM examples:');
    for (const row of rows) {
      console.log(
        `${row.training_example_id} | ${row.dialogue_function_code} | P:${row.pad_pleasure} A:${row.pad_arousal} D:${row.pad_dominance} | ${row.utterance_text}`
      );
    }
  } catch (err) {
    console.error('Error running LTLM task_management test:');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM task_management test script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM task_management test script:');
    console.error(err);
    process.exitCode = 1;
  });
