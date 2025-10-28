/**
 * Council Routes
 * ---------------
 * Primary endpoints for The Council of the Wise system.
 * Provides test and placeholder logic until database models are wired in.
 */

import express from "express";
const router = express.Router();

// Example: GET /api/expanse/council
router.get('/', (req, res) => {
  res.json({
    message: 'Council module active.',
    available_routes: [
      '/files',
      '/events',
      '/characters',
    ],
  });
});

// Example: GET /api/expanse/council/files
router.get('/files', (req, res) => {
  res.json({
    files: [
      { id: 1, name: 'File A: The Cheese Wars', status: 'classified' },
      { id: 2, name: 'File B: The Birth of Cheese Fang', status: 'restricted' },
    ],
  });
});


import pool from '../../db/pgPool.js';

router.get('/users-demo', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users LIMIT 3');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

router.post('/users-demo', async (req, res) => {
  const { user_id, username, password_hash } = req.body;
  if (!user_id || !username || !password_hash) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await pool.query(
      'INSERT INTO users (user_id, username, password_hash) VALUES ($1, $2, $3)',
      [user_id, username, password_hash]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/users-demo/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE user_id = $1', [user_id]);
    res.json({ success: true, deleted: result.rowCount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/users-demo/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { username, password_hash } = req.body;
  if (!username && !password_hash) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  const fields = [];
  const values = [];
  if (username) {
    fields.push('username = $' + (values.length + 1));
    values.push(username);
  }
  if (password_hash) {
    fields.push('password_hash = $' + (values.length + 1));
    values.push(password_hash);
  }
  values.push(user_id);
  try {
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE user_id = $${values.length}`,
      values
    );
    res.json({ success: true, updated: result.rowCount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
