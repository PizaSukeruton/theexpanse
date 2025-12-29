import express from 'express';
import pool from '../db/pool.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

function requireCheeseFang(req, res, next) {
  try {
    const user = req.user || {};
    const username = user.username;
    const accessLevel = user.access_level;

    if (username === 'Cheese Fang' && accessLevel === 11) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'God Mode is restricted to Cheese Fang (Level 11).'
    });
  } catch (error) {
    console.error('Error in requireCheeseFang:', error);
    return res.status(500).json({
      success: false,
      message: 'Access check failed.',
      error: error.message
    });
  }
}

router.get('/status', verifyToken, requireCheeseFang, async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT 1 AS ok');
    return res.json({
      success: true,
      mode: 'God Mode',
      user: req.user?.username || null,
      access_level: req.user?.access_level || null,
      database_ok: dbCheck.rows[0].ok === 1
    });
  } catch (error) {
    console.error('God Mode status error:', error);
    return res.status(500).json({
      success: false,
      message: 'God Mode status check failed.',
      error: error.message
    });
  }
});

router.get('/concept/:name', verifyToken, requireCheeseFang, async (req, res) => {
  const { name } = req.params;

  try {
    const query = `
      SELECT concept_id, concept_name, concept_type, concept_json
      FROM system_concepts
      WHERE concept_name = $1
    `;
    const result = await pool.query(query, [name]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No system_concept found for ' + name
      });
    }

    return res.json({
      success: true,
      concept: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching system_concept:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch system_concept',
      error: error.message
    });
  }
});

export default router;
