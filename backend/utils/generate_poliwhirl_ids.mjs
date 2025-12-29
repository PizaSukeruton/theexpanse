import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

async function generatePoliwhirlIds() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const objectId = await generateHexId('object_id');
    const inventoryEntryId = await generateHexId('inventory_entry_id');

    console.log('Poliwhirl object_id:', objectId);
    console.log('Poliwhirl inventory_entry_id:', inventoryEntryId);

    await client.query('ROLLBACK');
  } catch (error) {
    console.error('Error generating Poliwhirl IDs:', error.message);
  } finally {
    process.exit(0);
  }
}

generatePoliwhirlIds();
