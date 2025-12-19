// backend/TSE/bRollManager.js
// @name B-Roll Character Manager
// @description Manages autonomous behavior for B-Roll Chaos characters only.
// @version 1.0.0

import pool from '../db/pool.js'; // Assumes db/pool.js exists and exports a pg.Pool instance

const B_ROLL_CATEGORIES = ['B-Roll Chaos'];

/**
 * Retrieves all characters designated as B-roll and currently marked for autonomous behavior.
 * @returns {Promise<Array>} A promise that resolves to an array of B-roll character profiles.
 */
async function getAutonomousBRollCharacters() {
    try {
        const query = `
            SELECT character_id, character_name, category, is_b_roll_autonomous
            FROM character_profiles
            WHERE category = $1 AND is_b_roll_autonomous = TRUE;
        `;
        const result = await pool.query(query, [B_ROLL_CATEGORIES[0]]);
        console.log(`[bRollManager] Found ${result.rows.length} active B-Roll characters.`);
        return result.rows;
    } catch (error) {
        console.error('[bRollManager] Error fetching autonomous B-Roll characters:', error.message);
        throw new Error('Failed to retrieve autonomous B-Roll characters.');
    }
}

/**
 * Toggles the autonomous behavior flag for a specified B-roll character.
 * This operation is protected by the database constraint, which ensures non-B-roll
 * characters cannot have this flag set to TRUE/FALSE (it must remain NULL).
 * @param {string} characterId - The hex ID of the character to update.
 * @param {boolean} enable - True to enable autonomy, false to disable.
 * @returns {Promise<boolean>} True if the update was successful, false otherwise.
 */
async function toggleBRollAutonomy(characterId, enable) {
    try {
        // First, verify the character's category to provide a more descriptive error if needed
        const categoryCheck = await pool.query(
            `SELECT category FROM character_profiles WHERE character_id = $1;`,
            [characterId]
        );
        const character = categoryCheck.rows[0];

        if (!character) {
            throw new Error(`Character with ID ${characterId} not found.`);
        }

        if (!B_ROLL_CATEGORIES.includes(character.category)) {
            // This is primarily for a more user-friendly error message; the DB constraint
            // would also catch this if `enable` is not NULL.
            throw new Error(`Character ${character.character_name} (ID: ${characterId}) is not a B-Roll character and cannot have autonomy toggled.`);
        }

        const query = `
            UPDATE character_profiles
            SET is_b_roll_autonomous = $1, updated_at = CURRENT_TIMESTAMP
            WHERE character_id = $2 AND category = $3
            RETURNING character_id, is_b_roll_autonomous;
        `;
        const result = await pool.query(query, [enable, characterId, B_ROLL_CATEGORIES[0]]);

        if (result.rowCount === 0) {
            console.warn(`[bRollManager] Failed to toggle autonomy for ${characterId}. No rows updated.`);
            return false;
        }
        console.log(`[bRollManager] Toggled autonomy for character ${characterId} to ${enable}.`);
        return true;
    } catch (error) {
        console.error(`[bRollManager] Error toggling B-Roll autonomy for ${characterId}:`, error.message);
        throw error; // Re-throw to be caught by API endpoint error handler
    }
}

/**
 * Creates and stores a new B-Roll character in the character_profiles table.
 * @param {string} character_id - The unique hex ID of the character (e.g., '#R10000').
 * @param {string} character_name - The name of the B-Roll character.
 * @param {string} category - The category of the B-Roll character (e.g., 'B-Roll Chaos', 'Machines').
 * @param {string} [description=''] - Optional description for the character.
 * @param {boolean} [is_b_roll_autonomous=false] - Whether the character starts as autonomous.
 * @returns {Promise<object>} A promise that resolves to the created character object from the database.
 * @throws {Error} If character_id, character_name, or category are missing, or if character_id is invalid/already exists.
 */
async function createBRollCharacter(character_id, character_name, category, description = '', is_b_roll_autonomous = false) {
    if (!character_id || !character_name || !category) {
        throw new Error('Character ID, name, and category are required to create a B-Roll character.');
    }
    if (!character_id.match(/^#[0-9A-F]{6}$/i)) {
        throw new Error('Invalid character_id format. Must be #XXXXXX.');
    }
    if (!B_ROLL_CATEGORIES.includes(category)) {
        throw new Error(`Invalid category: ${category}. Must be one of ${B_ROLL_CATEGORIES.join(', ')}.`);
    }

    const client = await pool.connect();
    try {
        // Check if character_id already exists
        const checkQuery = 'SELECT COUNT(*) FROM character_profiles WHERE character_id = $1';
        const checkResult = await client.query(checkQuery, [character_id]);

        if (checkResult.rows[0].count > 0) {
            throw new Error(`B-Roll character with ID ${character_id} already exists.`);
        }

        // Insert into character_profiles, setting trait_vector to NULL and trait_generation_enabled to FALSE
        const insertQuery = `
            INSERT INTO character_profiles (character_id, character_name, category, description, is_b_roll_autonomous, created_at, updated_at, trait_vector, trait_generation_enabled)
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NULL, FALSE)
            RETURNING character_id, character_name, category, is_b_roll_autonomous, description;
        `;
        const result = await client.query(insertQuery, [character_id, character_name, category, description, is_b_roll_autonomous]);
        
        if (result.rows.length > 0) {
            console.log(`[BRollManager] Created new B-Roll character: ${character_name} (${character_id}) in category ${category}.`);
            return result.rows[0];
        }
        return null;
    } catch (error) {
        console.error(`[BRollManager] Error creating B-Roll character ${character_id}:`, error.message);
        throw error; // Re-throw to be caught by API endpoint handler
    } finally {
        client.release();
    }
}

/**
 * Placeholder for future complex B-roll behavior simulation logic.
 * This function will be expanded after deep research into behavioral modes and parameters.
 * For now, it simply logs a message.
 * @param {object} characterProfile - The profile of the B-roll character to simulate.
 */
function simulateBRollBehavior(characterProfile) {
    if (!characterProfile.is_b_roll_autonomous) {
        // This character is not set to be autonomous or is not a B-Roll character
        return;
    }
    console.log(`[bRollManager] Simulating autonomous behavior for: ${characterProfile.character_name} (ID: ${characterProfile.character_id})`);
    // Future logic here:
    // - Based on characterProfile.b_roll_mode, characterProfile.activity_level, etc.
    // - Potentially interact with a game world state (e.g., move in a scene)
    // - Generate ambient events or simple reactions
}

export {
    getAutonomousBRollCharacters,
    toggleBRollAutonomy,
    simulateBRollBehavior,
    createBRollCharacter // NEW: Export the character creation function
};
