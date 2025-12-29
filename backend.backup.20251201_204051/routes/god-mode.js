import express from 'express';
import pool from '../db/pool.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/wizards', verifyToken, async (req, res) => {
  try {
    const userLevel = req.user.access_level;
    
    const query = `
      SELECT 
        wizard_id,
        wizard_name,
        wizard_type,
        description,
        frontend_file,
        version
      FROM wizard_guides
      WHERE $1 = ANY(access_levels)
        AND is_active = true
      ORDER BY wizard_name ASC
    `;
    
    const result = await pool.query(query, [userLevel]);
    
    res.json({
      success: true,
      wizards: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching wizards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wizards',
      error: error.message
    });
  }
});

export default router;
