/**
 * resolveOmiyageChoice.mjs - v1.1
 * 
 * Resolves a 'chosen_unresolved' choice to 'resolved' state,
 * capturing both the object_id AND the giver's inventory_entry_id.
 * 
 * This must run BEFORE fulfilOmiyage.mjs
 * 
 * Usage: node backend/scripts/resolveOmiyageChoice_v1.1.mjs '#OMI0002'
 */

import pool from '../db/pool.js';

async function resolveOmiyageChoice(choiceId) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Atomic resolution: map chosen_number → object + inventory_entry_id
    const { rows } = await client.query(`
      WITH ordered_inventory AS (
        SELECT
          ci.inventory_entry_id,
          ci.object_id,
          ROW_NUMBER() OVER (ORDER BY ci.inventory_entry_id ASC) AS position
        FROM character_inventory ci
        WHERE ci.character_id = (
          SELECT character_id FROM omiyage_choice_state WHERE choice_id = $1
        )
        AND (ci.binding_type IS NULL OR ci.binding_type <> 'soulbound')
      )
      UPDATE omiyage_choice_state
      SET
        status = 'resolved',
        resolved_object_id = o.object_id,
        giver_inventory_entry_id = o.inventory_entry_id,
        resolved_at = NOW()
      FROM ordered_inventory o
      WHERE omiyage_choice_state.choice_id = $1
        AND omiyage_choice_state.status = 'chosen_unresolved'
        AND o.position = omiyage_choice_state.chosen_number
      RETURNING 
        omiyage_choice_state.choice_id,
        omiyage_choice_state.character_id,
        omiyage_choice_state.chosen_number,
        omiyage_choice_state.resolved_object_id,
        omiyage_choice_state.giver_inventory_entry_id,
        omiyage_choice_state.resolved_at
    `, [choiceId]);

    if (rows.length === 0) {
      // Check why it failed
      const checkResult = await client.query(`
        SELECT choice_id, status FROM omiyage_choice_state WHERE choice_id = $1
      `, [choiceId]);
      
      if (checkResult.rows.length === 0) {
        throw new Error(`Choice ${choiceId} does not exist`);
      } else {
        throw new Error(`Choice ${choiceId} has status '${checkResult.rows[0].status}' — expected 'chosen_unresolved'`);
      }
    }

    await client.query('COMMIT');

    const result = rows[0];
    console.log('✓ Resolution complete');
    console.log(`  Choice: ${result.choice_id}`);
    console.log(`  Giver: ${result.character_id}`);
    console.log(`  Chosen number: ${result.chosen_number}`);
    console.log(`  Object: ${result.resolved_object_id}`);
    console.log(`  Inventory entry: ${result.giver_inventory_entry_id}`);
    console.log(`  Resolved at: ${result.resolved_at}`);

    return result;

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('✗ Resolution failed:', e.message);
    throw e;
  } finally {
    client.release();
  }
}

// CLI execution
const [choiceId] = process.argv.slice(2);

if (!choiceId) {
  console.error('Usage: node resolveOmiyageChoice_v1.1.mjs <choice_id>');
  console.error('Example: node resolveOmiyageChoice_v1.1.mjs "#OMI0002"');
  process.exit(1);
}

resolveOmiyageChoice(choiceId)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
