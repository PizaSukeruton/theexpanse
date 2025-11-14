// backend/traits/TraitManager.js

import pool from '../db/pool.js';

/**
 * @module TraitManager
 * @description Manages character personality traits, including fetching and updating scores.
 * This module interacts with the 'character_trait_scores' table.
 */
class TraitManager {
    constructor() {
        console.log('TraitManager initialized.');
    }

    /**
     * Retrieves all trait scores for a given character as a vector (object mapping trait_hex_color to percentile_score).
     * This method is named getTraitVector to match the call in smartchat.js.
     * @param {string} characterId - The hex ID of the character.
     * @returns {Promise<Object>} - An object mapping trait_hex_color to percentile_score (0-100).
     */
    async getTraitVector(characterId) { // RENAMED from getCharacterTraitScores
        try {
            // Fetch trait scores from the database.
            // NOTE: The column name in character_trait_scores is 'percentile_score', not 'percentile_score'.
            const query = `
                SELECT trait_hex_color, percentile_score
                FROM character_trait_scores
                WHERE character_hex_id = $1;
            `;
            const res = await pool.query(query, [characterId]);
            const traitScores = {};
            res.rows.forEach(row => {
                traitScores[row.trait_hex_color] = row.percentile_score; // Use 'percentile_score' column
            });
            return traitScores;
        } catch (error) {
            console.error(`Error fetching trait vector for character ${characterId}:`, error);
            // Return empty scores to prevent blocking the application flow.
            throw error;
        }
    }

    /**
     * Updates a specific trait score for a character.
     * This method would typically be called by the TSE learning loop.
     * @param {string} characterId - The hex ID of the character.
     * @param {string} traitHexId - The hex ID of the trait to update.
     * @param {number} delta - The amount to change the trait score by (0-100 percentile).
     * @returns {Promise<void>}
     */
    async updateTrait(characterId, traitHexId, delta) {
        try {
            console.log(`Attempting to update trait ${traitHexId} for character ${characterId} by delta ${delta}.`);

            // Example of what the actual DB interaction might look like:
            const currentScoreQuery = `SELECT percentile_score FROM character_trait_scores WHERE character_hex_id = $1 AND trait_hex_color = $2;`;
            const currentScoreRes = await pool.query(currentScoreQuery, [characterId, traitHexId]);
            let currentScore = currentScoreRes.rows[0] ? currentScoreRes.rows[0].percentile : 50; // Default if not found

            let newScore = Math.min(100, Math.max(0, currentScore + delta));

            const upsertQuery = `
                INSERT INTO character_trait_scores (character_hex_id, trait_hex_color, percentile_score)
                VALUES ($1, $2, $3)
                ON CONFLICT (character_hex_id, trait_hex_color) DO UPDATE SET percentile_score = EXCLUDED.percentile_score;
            `;
            await pool.query(upsertQuery, [characterId, traitHexId, newScore]);
        } catch (error) {
            console.error(`Error updating trait ${traitHexId} for character ${characterId}:`, error);
        }
    }
}

// Export a singleton instance of TraitManager
const traitManagerInstance = new TraitManager();

// Export the specific method directly for destructuring in smartchat.js
// This makes `const { getTraitVector } = require(...)` work.
export default traitManagerInstance;

