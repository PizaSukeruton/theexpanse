import pool from './backend/db/pool.js';
import generateHexId from './backend/utils/hexIdGenerator.js';

async function main() {
  const { rows } = await pool.query("SELECT row_number() OVER () AS rn, * FROM learning_vocabulary WHERE vocab_hex_id IS NULL ORDER BY created_at");
  for (const row of rows) {
    const newHex = await generateHexId('learningvocabid');
    await pool.query("UPDATE learning_vocabulary SET vocab_hex_id = $1 WHERE row_number() OVER () = $2", [newHex, row.rn]);
    console.log(`Row ${row.rn} updated to ${newHex}`);
  }
  process.exit(0);
}

main();
