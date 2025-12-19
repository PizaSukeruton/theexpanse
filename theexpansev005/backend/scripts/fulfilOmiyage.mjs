import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

async function fulfilOmiyage(choiceId, receiverCharacterId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Generate inventory entry ID (HEX, canonical)
    const inventoryEntryId = await generateHexId('inventory_entry_id');

    // 2. Fetch resolved object
    const { rows } = await client.query(
      `
      SELECT resolved_object_id
      FROM omiyage_choice_state
      WHERE choice_id = $1
        AND status = 'resolved'
      `,
      [choiceId]
    );

    if (rows.length === 0) {
      throw new Error('Omiyage not resolved or missing');
    }

    const objectId = rows[0].resolved_object_id;

    // 3. Insert into receiver inventory (slot_trait_hex_id REQUIRED)
    await client.query(
      `
      INSERT INTO character_inventory (
        inventory_entry_id,
        character_id,
        object_id,
        slot_trait_hex_id,
        binding_type
      ) VALUES ($1, $2, $3, '#00010E', NULL)
      `,
      [inventoryEntryId, receiverCharacterId, objectId]
    );

    await client.query('COMMIT');

    console.log('[OmiyageFulfilment] SUCCESS', {
      inventoryEntryId,
      receiverCharacterId,
      objectId
    });

    process.exit(0);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[OmiyageFulfilment] FAILED', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

// CLI usage
const [, , choiceId, receiverCharacterId] = process.argv;

if (!choiceId || !receiverCharacterId) {
  console.error('Usage: node fulfilOmiyage.mjs <choiceId> <receiverCharacterId>');
  process.exit(1);
}

await fulfilOmiyage(choiceId, receiverCharacterId);
