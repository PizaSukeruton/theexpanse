import express from 'express';
import pool from '../backend/db/pool.js';
import { requireAdmin } from '../backend/middleware/requireAdmin.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const router = express.Router();

router.get('/', requireAdmin(), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM character_profiles ORDER BY created_at DESC'
    );
    res.json({ success: true, characters: result.rows });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch characters' });
  }
});

router.post('/', requireAdmin(), async (req, res) => {
  try {
    const { character_name, category, description, image_url } = req.body;
    const character_id = await generateHexId('character_id');
    
    const result = await pool.query(
      `INSERT INTO character_profiles (character_id, character_name, category, description, image_url) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [character_id, character_name, category, description, image_url]
    );
    
    res.json({ success: true, character: result.rows[0] });
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', requireAdmin(), async (req, res) => {
  try {
    const { id } = req.params;
    const { character_name, category, description, image_url } = req.body;
    
    const result = await pool.query(
      `UPDATE character_profiles 
       SET character_name = $1, category = $2, description = $3, image_url = $4, updated_at = CURRENT_TIMESTAMP
       WHERE character_id = $5 RETURNING *`,
      [character_name, category, description, image_url, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Character not found' });
    }
    
    res.json({ success: true, character: result.rows[0] });
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
