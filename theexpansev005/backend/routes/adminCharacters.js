import express from 'express';
import pool from '../db/pool.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import generateHexId from '../utils/hexIdGenerator.js';

const router = express.Router();

// GET ALL CHARACTERS
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

// CREATE CHARACTER (AND TWIN KNOWLEDGE ENTITY)
router.post('/', requireAdmin(), async (req, res) => {
  const client = await pool.connect();
  try {
    const { character_name, category, description, image_url } = req.body;
    
    await client.query('BEGIN');

    const character_id = await generateHexId('character_id');
    const charResult = await client.query(
      `INSERT INTO character_profiles (character_id, character_name, category, description, image_url) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [character_id, character_name, category, description, image_url]
    );

    const knowledge_id = await generateHexId('character_id');
    const knowledgeName = character_name + " Knowledge";
    
    await client.query(
      `INSERT INTO character_profiles (character_id, character_name, category, description) 
       VALUES ($1, $2, $3, $4)`,
      [knowledge_id, knowledgeName, 'Knowledge Entity', description]
    );

    await client.query('COMMIT');
    res.json({ success: true, character: charResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating character:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

// UPDATE CHARACTER (AND APPEND TO KNOWLEDGE ENTITY)
router.put('/:id', requireAdmin(), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { character_name, category, description, image_url } = req.body;
    
    await client.query('BEGIN');

    const oldData = await client.query(
        'SELECT character_name FROM character_profiles WHERE character_id = $1',
        [id]
    );
    
    if (oldData.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Character not found' });
    }
    const oldName = oldData.rows[0].character_name;

    // 1. Update the Actor (Overwrite - keep it clean)
    const result = await client.query(
      `UPDATE character_profiles 
       SET character_name = $1, category = $2, description = $3, image_url = $4, updated_at = CURRENT_TIMESTAMP
       WHERE character_id = $5 RETURNING *`,
      [character_name, category, description, image_url, id]
    );
    
    // 2. Update the Knowledge Entity (APPEND - Keep history)
    const oldKnowledgeName = oldName + " Knowledge";
    const newKnowledgeName = character_name + " Knowledge";

    // Logic: 
    // 1. Rename if name changed.
    // 2. Append the new description to the bottom of the existing one with a timestamp.
    // This creates a "Growing System".
    
    await client.query(
        `UPDATE character_profiles 
         SET character_name = $1, 
             description = COALESCE(description, '') || E'\n\n--- [UPDATE ' || NOW()::date || E'] ---\n' || $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE character_name = $3 AND category = 'Knowledge Entity'`,
        [newKnowledgeName, description, oldKnowledgeName]
    );
    
    await client.query('COMMIT');
    res.json({ success: true, character: result.rows[0] });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating character:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

export default router;
