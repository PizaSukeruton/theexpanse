/**
 * fulfilOmiyage.mjs - v1.1 (PATCHED)
 * 
 * Fix: Uses slot_trait_hex_id from the deleted item instead of hardcoded value
 */

import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

async function fulfilOmiyage(choiceId, receiverCharacterId) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(`
      SELECT 
        resolved_object_id,
        giver_inventory_entry_id,
        character_id AS giver_character_id
      FROM omiyage_choice_state
      WHERE choice_id = $1
        AND status = 'resolved'
    `, [choiceId]);

    if (rows.length === 0) {
      throw new Error(`No resolved choice found for ${choiceId}`);
    }

    const { resolved_object_id, giver_inventory_entry_id, giver_character_id } = rows[0];

    if (!giver_inventory_entry_id) {
      throw new Error(`Choice ${choiceId} has no giver_inventory_entry_id — was it resolved before v1.1?`);
    }

    // DELETE and capture the original slot_trait_hex_id
    const deleteResult = await client.query(`
      DELETE FROM character_inventory
      WHERE inventory_entry_id = $1
        AND character_id = $2
      RETURNING *
    `, [giver_inventory_entry_id, giver_character_id]);

    if (deleteResult.rows.length === 0) {
      throw new Error(`Failed to delete inventory entry ${giver_inventory_entry_id} from ${giver_character_id}`);
    }

    const originalSlot = deleteResult.rows[0].slot_trait_hex_id;
    console.log(`✓ Deleted ${giver_inventory_entry_id} from ${giver_character_id} (slot: ${originalSlot})`);

    const newInventoryEntryId = await generateHexId('inventory_entry_id');

    // Use the original slot_trait_hex_id
    await client.query(`
      INSERT INTO character_inventory (
        inventory_entry_id,
        character_id,
        object_id,
        binding_type,
        slot_trait_hex_id
      ) VALUES ($1, $2, $3, NULL, $4)
    `, [newInventoryEntryId, receiverCharacterId, resolved_object_id, originalSlot]);

    console.log(`✓ Created ${newInventoryEntryId} for ${receiverCharacterId} (slot: ${originalSlot})`);

    const auditId = await generateHexId('omiyage_event_id');
    
    await client.query(`
      INSERT INTO omiyage_fulfilment_audit (
        audit_id,
        choice_id,
        giver_character_id,
        receiver_character_id,
        object_id,
        inventory_entry_id,
        fulfilment_method,
        source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      auditId,
      choiceId,
      giver_character_id,
      receiverCharacterId,
      resolved_object_id,
      newInventoryEntryId,
      'blind_bag',
      'fulfilOmiyage_v1.1'
    ]);

    console.log(`✓ Audit record ${auditId} created`);

    await client.query('COMMIT');

    return {
      success: true,
      choiceId,
      giverCharacterId: giver_character_id,
      receiverCharacterId,
      objectId: resolved_object_id,
      deletedInventoryEntryId: giver_inventory_entry_id,
      newInventoryEntryId,
      slotTraitHexId: originalSlot,
      auditId
    };

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('✗ Fulfilment failed:', e.message);
    throw e;
  } finally {
    client.release();
  }
}

const [choiceId, receiverCharacterId] = process.argv.slice(2);

if (!choiceId || !receiverCharacterId) {
  console.error('Usage: node fulfilOmiyage_v1.1.mjs <choice_id> <receiver_character_id>');
  process.exit(1);
}

fulfilOmiyage(choiceId, receiverCharacterId)
  .then(result => {
    console.log('\n=== Fulfilment Complete ===');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(() => process.exit(1));
