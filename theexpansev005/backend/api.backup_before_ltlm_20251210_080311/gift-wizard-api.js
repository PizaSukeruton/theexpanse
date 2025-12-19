/**
 * Gift Wizard API
 * Agnostic endpoint for gift experiment wizard
 */

import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

/**
 * Get all realms accessible to user
 * @param {number} userAccessLevel - User's access level
 * @returns {Promise<Array>} Array of realm objects
 */
export async function getRealms(userAccessLevel) {
  try {
    // Get realms from locations table
    const result = await pool.query(
      "SELECT DISTINCT realm FROM locations ORDER BY realm"
    );
    
    const realms = result.rows.map(row => ({
      name: row.realm,
      access_level: 1 // Simplified - user can access their own realm
    }));
    
    return {
      success: true,
      realms: realms
    };
  } catch (error) {
    console.error('Error fetching realms:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get locations for a specific realm
 * @param {string} realm - Realm name
 * @param {number} userAccessLevel - User's access level
 * @returns {Promise<Array>} Array of locations
 */
export async function getLocationsByRealm(realm, userAccessLevel) {
  try {
    // Query locations in this realm
    const result = await pool.query(
      "SELECT location_id, name, description FROM locations WHERE realm = $1 ORDER BY name",
      [realm]
    );
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: `No locations found in realm "${realm}"`
      };
    }
    
    return {
      success: true,
      locations: result.rows
    };
  } catch (error) {
    console.error('Error fetching locations:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get characters accessible to user
 * @param {string} realm - Realm name
 * @param {number} userAccessLevel - User's access level
 * @returns {Promise<Array>} Array of characters
 */
export async function getCharactersByRealm(realm, userAccessLevel) {
  try {
    const result = await pool.query(
      "SELECT character_id, character_name, category FROM character_profiles ORDER BY character_name LIMIT 20"
    );
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'No characters found'
      };
    }
    
    return {
      success: true,
      characters: result.rows
    };
  } catch (error) {
    console.error('Error fetching characters:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create gift exchange event
 * @param {Object} eventData - Event data from wizard
 * @returns {Promise<Object>} Created event
 */
export async function createGiftExchangeEvent(eventData) {
  try {
    const eventId = generateHexId('event_id');
    
    const result = await pool.query(
      `INSERT INTO multiverse_events 
       (event_id, realm, location, event_type, giver_id, receiver_id, outcome, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        eventId,
        eventData.realm,
        eventData.location_id,
        'gift_exchange',
        eventData.giver_id,
        eventData.receiver_id,
        eventData.outcome || 'success'
      ]
    );
    
    return {
      success: true,
      event: result.rows[0]
    };
  } catch (error) {
    console.error('Error creating event:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default { getRealms, getLocationsByRealm, getCharactersByRealm, createGiftExchangeEvent };
