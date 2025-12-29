// backend/services/omiyageService.js
// Omiyage v2 - Gift Ritual Orchestrator
// Date: 2025-12-18

import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';
import { buildStorytellerResponse } from './storytellerWrapper.js';

const CLAUDE_ID = '#700002';

/**
 * Check if user has already completed first-login Omiyage
 */
export async function hasCompletedFirstOmiyage(userId) {
  const result = await pool.query(`
    SELECT status FROM omiyage_choice_state 
    WHERE user_id = $1 
      AND source = 'first_login'
      AND status IN ('fulfilled', 'declined')
    LIMIT 1
  `, [userId]);
  return result.rows.length > 0;
}

/**
 * Check if user has a pending (mid-ritual) Omiyage
 */
export async function getPendingOmiyage(userId) {
  const result = await pool.query(`
    SELECT choice_id, offer_count, status, resolved_object_id
    FROM omiyage_choice_state 
    WHERE user_id = $1 
      AND source = 'first_login'
      AND status IN ('chosen_unresolved', 'resolved')
    ORDER BY created_at DESC
    LIMIT 1
  `, [userId]);
  return result.rows[0] || null;
}

/**
 * Get Claude's offerable inventory count
 */
export async function getOfferableCount() {
  const result = await pool.query(`
    SELECT COUNT(*) as count
    FROM character_inventory
    WHERE character_id = $1
      AND (binding_type IS NULL OR binding_type <> 'soulbound')
  `, [CLAUDE_ID]);
  return parseInt(result.rows[0].count, 10);
}

/**
 * Create a new Omiyage offer for first-login
 * Uses transaction with FOR UPDATE to prevent concurrent duplicate offers
 */
export async function createOmiyageOffer(userId, offerCount) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check for existing active offer (concurrent socket protection)
    const existing = await client.query(`
      SELECT choice_id FROM omiyage_choice_state
      WHERE user_id = $1 AND status IN ('chosen_unresolved', 'resolved')
      FOR UPDATE
    `, [userId]);
    
    if (existing.rows.length > 0) {
      // Already has active offer - return existing
      await client.query('COMMIT');
      return existing.rows[0].choice_id;
    }
    
    // NOTE: Using omiyage_event_id for choice IDs
    // Future: Consider distinct omiyage_choice_id range
    const choiceId = await generateHexId('omiyage_event_id');
    
    await client.query(`
      INSERT INTO omiyage_choice_state (
        choice_id, user_id, character_id, offer_count, 
        chosen_number, status, source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [choiceId, userId, CLAUDE_ID, offerCount, 0, 'chosen_unresolved', 'first_login']);
    
    await client.query('COMMIT');
    return choiceId;
    
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Build the offer narrative using LTLM
 */
export async function buildOfferNarrative(offerCount) {
  const result = await buildStorytellerResponse({
    intentResult: { type: 'SYSTEM_OMIYAGE_OFFER' },
    contentBlocks: [`I have ${offerCount} treasures from my journeys. Pick a number, 1 to ${offerCount}.`],
    tone: 'playful',
    formality: 'casual',
    outcomeIntent: 'connection',
    strategy: 'gift_offer'
  });
  return result.output;
}

/**
 * Record user's choice and resolve to specific object
 * NOTE: Inventory ordering assumes Claude's inventory is static during resolution.
 * Do not mutate Claude's inventory concurrently.
 */
export async function resolveChoice(choiceId, chosenNumber) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Verify choice exists and is unresolved
    const choiceResult = await client.query(`
      SELECT offer_count, status 
      FROM omiyage_choice_state 
      WHERE choice_id = $1
      FOR UPDATE
    `, [choiceId]);
    
    if (!choiceResult.rows.length) {
      throw new Error('Invalid choice ID');
    }
    
    const { offer_count, status } = choiceResult.rows[0];
    
    // Idempotent: Already resolved - return current state
    if (status !== 'chosen_unresolved') {
      await client.query('ROLLBACK');
      return { alreadyResolved: true, status };
    }
    
    if (chosenNumber < 1 || chosenNumber > offer_count) {
      throw new Error(`Choice must be between 1 and ${offer_count}`);
    }
    
    // 2. Resolve to specific object using deterministic ROW_NUMBER
    const inventoryResult = await client.query(`
      WITH ordered_inventory AS (
        SELECT 
          inventory_entry_id,
          object_id,
          ROW_NUMBER() OVER (ORDER BY inventory_entry_id ASC) AS position
        FROM character_inventory
        WHERE character_id = $1
          AND (binding_type IS NULL OR binding_type <> 'soulbound')
      )
      SELECT inventory_entry_id, object_id 
      FROM ordered_inventory 
      WHERE position = $2
    `, [CLAUDE_ID, chosenNumber]);
    
    if (!inventoryResult.rows.length) {
      throw new Error('Failed to resolve object');
    }
    
    const { inventory_entry_id, object_id } = inventoryResult.rows[0];
    
    // 3. Update choice state to resolved
    await client.query(`
      UPDATE omiyage_choice_state
      SET status = 'resolved',
          chosen_number = $2,
          resolved_object_id = $3,
          giver_inventory_entry_id = $4,
          resolved_at = NOW()
      WHERE choice_id = $1
    `, [choiceId, chosenNumber, object_id, inventory_entry_id]);
    
    await client.query('COMMIT');
    
    return {
      alreadyResolved: false,
      objectId: object_id,
      inventoryEntryId: inventory_entry_id
    };
    
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Complete the fulfilment: transfer item, write audit, update status
 */
export async function fulfilOmiyage(choiceId, receiverCharacterId) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Get resolved choice
    const choiceResult = await client.query(`
      SELECT resolved_object_id, giver_inventory_entry_id, character_id, status
      FROM omiyage_choice_state
      WHERE choice_id = $1
      FOR UPDATE
    `, [choiceId]);
    
    if (!choiceResult.rows.length) {
      throw new Error('No choice found');
    }
    
    const { resolved_object_id, giver_inventory_entry_id, character_id, status } = choiceResult.rows[0];
    
    // Idempotent: Already fulfilled
    if (status === 'fulfilled') {
      await client.query('ROLLBACK');
      // Fetch object details for response
      const objectResult = await pool.query(`
        SELECT object_name, object_type, description, rarity, p, a, d
        FROM objects WHERE object_id = $1
      `, [resolved_object_id]);
      return {
        success: true,
        alreadyFulfilled: true,
        object: objectResult.rows[0]
      };
    }
    
    if (status !== 'resolved') {
      throw new Error(`Cannot fulfil choice with status: ${status}`);
    }
    
    // 2. Delete from giver's inventory
    const deleteResult = await client.query(`
      DELETE FROM character_inventory
      WHERE inventory_entry_id = $1 AND character_id = $2
      RETURNING *
    `, [giver_inventory_entry_id, character_id]);
    
    if (!deleteResult.rows.length) {
      throw new Error('Failed to remove item from giver inventory');
    }
    
    // 3. Insert into receiver's inventory
    const newInventoryEntryId = await generateHexId('inventory_entry_id');
    
    await client.query(`
      INSERT INTO character_inventory (
        inventory_entry_id, character_id, object_id, binding_type, slot_trait_hex_id
      ) VALUES ($1, $2, $3, NULL, '#00010E')
    `, [newInventoryEntryId, receiverCharacterId, resolved_object_id]);
    
    // 4. Write audit record
    // NOTE: Using omiyage_event_id for audit IDs
    // Future: Consider distinct omiyage_audit_id range
    const auditId = await generateHexId('omiyage_event_id');
    
    await client.query(`
      INSERT INTO omiyage_fulfilment_audit (
        audit_id, choice_id, giver_character_id, receiver_character_id,
        object_id, inventory_entry_id, fulfilment_method, source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [auditId, choiceId, character_id, receiverCharacterId, 
        resolved_object_id, newInventoryEntryId, 'blind_bag', 'omiyageService_v2']);
    
    // 5. Update choice state to fulfilled
    await client.query(`
      UPDATE omiyage_choice_state
      SET status = 'fulfilled', fulfilled_at = NOW()
      WHERE choice_id = $1
    `, [choiceId]);
    
    await client.query('COMMIT');
    
    // 6. Get object details for narrative (non-critical, safe outside transaction)
    const objectResult = await pool.query(`
      SELECT object_name, object_type, description, rarity, p, a, d
      FROM objects WHERE object_id = $1
    `, [resolved_object_id]);
    
    return {
      success: true,
      alreadyFulfilled: false,
      auditId,
      object: objectResult.rows[0],
      newInventoryEntryId
    };
    
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Build the fulfilment narrative using LTLM
 */
export async function buildFulfilmentNarrative(object) {
  const rarityFlair = object.rarity === 'legendary' ? 'A legendary find!' : 
                      object.rarity === 'rare' ? 'Quite rare, this one.' : '';
  
  const contentBlocks = [
    `You receive the **${object.object_name}**.`,
    rarityFlair,
    object.description
  ].filter(Boolean);
  
  const result = await buildStorytellerResponse({
    intentResult: { type: 'SYSTEM_OMIYAGE_REVEAL' },
    contentBlocks,
    tone: 'playful',
    formality: 'casual',
    outcomeIntent: 'connection',
    strategy: 'gift_reveal'
  });
  return result.output;
}

/**
 * Handle decline
 */
export async function declineOmiyage(choiceId) {
  await pool.query(`
    UPDATE omiyage_choice_state
    SET status = 'declined'
    WHERE choice_id = $1 AND status = 'chosen_unresolved'
  `, [choiceId]);
  
  const result = await buildStorytellerResponse({
    intentResult: { type: 'SYSTEM_OMIYAGE_DECLINE' },
    contentBlocks: ['Your choice is respected.'],
    tone: 'warm',
    formality: 'casual',
    outcomeIntent: 'validation',
    strategy: 'gift_decline'
  });
  return result.output;
}

/**
 * Main entry point: Check and initiate Omiyage on socket connect
 */
export async function checkAndInitiateOmiyage(userId) {
  // 1. Already completed?
  if (await hasCompletedFirstOmiyage(userId)) {
    console.log(`[Omiyage] User ${userId} already completed first-login Omiyage`);
    return null;
  }
  
  // 2. Pending offer to resume?
  const pending = await getPendingOmiyage(userId);
  if (pending) {
    console.log(`[Omiyage] Resuming pending offer ${pending.choice_id} for ${userId}`);
    
    // If already resolved, skip to fulfilment
    if (pending.status === 'resolved') {
      return {
        type: 'resume_resolved',
        choiceId: pending.choice_id,
        status: 'resolved'
      };
    }
    
    const narrative = await buildOfferNarrative(pending.offer_count);
    return {
      type: 'resume',
      choiceId: pending.choice_id,
      offerCount: pending.offer_count,
      narrative
    };
  }
  
  // 3. Check inventory
  const offerCount = await getOfferableCount();
  if (offerCount === 0) {
    console.error('[Omiyage] [ALERT] Claude has no giftable items — skipping offer');
    return null;
  }
  
  // 4. Create new offer (with concurrent socket protection)
  const choiceId = await createOmiyageOffer(userId, offerCount);
  const narrative = await buildOfferNarrative(offerCount);
  
  console.log(`[Omiyage] Created new offer ${choiceId} for ${userId} with ${offerCount} items`);
  
  return {
    type: 'new',
    choiceId,
    offerCount,
    narrative
  };
}
