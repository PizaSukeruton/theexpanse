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
     * Retrieves all trait scores for a given character as a vector.
     * @param {string} characterId - The hex ID of the character.
     * @returns {Promise<Object>} - An object mapping trait_hex_color to percentile_score (0-100).
     */
    async getTraitVector(characterId) {
        try {
            const query = `
                SELECT trait_hex_color, percentile_score
                FROM character_trait_scores
                WHERE character_hex_id = $1;
            `;
            const res = await pool.query(query, [characterId]);
            const traitScores = {};
            res.rows.forEach(row => {
                // Ensure we map the correct column name from DB result
                traitScores[row.trait_hex_color] = row.percentile_score; 
            });
            return traitScores;
        } catch (error) {
            console.error(`Error fetching trait vector for character ${characterId}:`, error);
            return {};
        }
    }

    /**
     * Updates a specific trait score for a character.
     * @param {string} characterId - The hex ID of the character.
     * @param {string} traitHexId - The hex ID of the trait to update.
     * @param {number} delta - The amount to change the trait score by.
     */
    async updateTrait(characterId, traitHexId, delta) {
        try {
            // Fetch current score or default to 50
            const currentScoreQuery = `SELECT percentile_score FROM character_trait_scores WHERE character_hex_id = $1 AND trait_hex_color = $2;`;
            const currentScoreRes = await pool.query(currentScoreQuery, [characterId, traitHexId]);
            let currentScore = currentScoreRes.rows[0] ? currentScoreRes.rows[0].percentile_score : 50;

            let newScore = Math.min(100, Math.max(0, currentScore + delta));

            const upsertQuery = `
                INSERT INTO character_trait_scores (character_hex_id, trait_hex_color, percentile_score)
                VALUES ($1, $2, $3)
                ON CONFLICT (character_hex_id, trait_hex_color) DO UPDATE SET percentile_score = EXCLUDED.percentile_score;
            `;
            await pool.query(upsertQuery, [characterId, traitHexId, newScore]);
            console.log(`Updated trait ${traitHexId} for ${characterId} to ${newScore}`);
        } catch (error) {
            console.error(`Error updating trait ${traitHexId} for character ${characterId}:`, error);
        }
    }
}

// EXPORT AN INSTANCE (Singleton), not the class
const traitManager = new TraitManager();
export default traitManager;
