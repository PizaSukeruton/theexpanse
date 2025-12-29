import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

async function generateClaudeInventoryIds() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ids = [];
    for (let i = 0; i < 5; i += 1) {
      const id = await generateHexId('inventory_entry_id');
      ids.push(id);
    }

    console.log('New inventory_entry_id values for Claude:', ids);

    await client.query('ROLLBACK');
  } catch (error) {
    console.error('Error generating inventory_entry_id values:', error.message);
  } finally {
    process.exit(0);
  }
}

generateClaudeInventoryIds();
