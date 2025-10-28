// backend/api/character.js
// Fixed version with proper pool import

import express from 'express';
const router = express.Router();
import pool from '../db/pool.js'; // Added missing pool import

// GET /api/character?character_id=#700002
router.get('/', async (req, res) => {
    const { character_id } = req.query;

    if (!/^#[0-9A-Fa-f]{6}$/.test(character_id)) {
        return res.status(400).json({ error: 'Invalid character_id. Must be hex format.' });
    }

    try {
        const result = await pool.query(`
            SELECT character_id, character_name, category, description, created_at, updated_at
            FROM character_profiles
            WHERE character_id = $1
        `, [character_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Character not found.' });
        }

        return res.json(result.rows[0]);

    } catch (err) {
        console.error('Error fetching character profile:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
