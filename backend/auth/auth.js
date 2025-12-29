// routes/auth.js
// HTTP-based authentication endpoints

import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/pool.js';

const router = express.Router();

// POST /auth/login - HTTP login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password required'
      });
    }

    // Query user from database
    const result = await pool.query(
      'SELECT user_id, username, access_level, password_hash, owned_character_id FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];
    console.log("[AuthDebug] user object:", user);

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // Create session (cookie set automatically by express-session)
    req.session.userId = user.user_id;
    req.session.ownedCharacterId = user.owned_character_id;
    req.session.username = user.username;
    req.session.accessLevel = user.access_level;

    console.log('✅ HTTP Login success:', user.username, 'Level:', user.access_level);

    return res.json({
      success: true,
      user: {
        user_id: user.user_id,
        username: user.username,
        access_level: user.access_level
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// POST /auth/logout - Clear session
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.clearCookie('expanse.sid');
    return res.json({ success: true });
  });
});

// GET /auth/check - Check if user is authenticated
router.get('/check', (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({
      authenticated: true,
      user: {
        user_id: req.session.userId,
        username: req.session.username,
        access_level: req.session.accessLevel
      }
    });
  }
  return res.json({ authenticated: false });
});

export default router;

// ---- AUTO-GENERATED GET LOGOUT ROUTE ----
router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.clearCookie("connect.sid", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/"
      });
      res.status(200).json({ success: true, message: "Logged out (GET)" });
    });
  } else {
    res.status(200).json({ success: true, message: "No active session" });
  }
});
