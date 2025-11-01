import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../backend/db/pool.js';
import { generateToken, verifyToken } from '../backend/utils/jwtUtil.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query(
      'SELECT user_id, username, password_hash, access_level FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0 || !await bcrypt.compare(password, result.rows[0].password_hash)) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    const user = result.rows[0];
    
    if (user.access_level < 5) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required (level 5+)' 
      });
    }
    
    const token = generateToken(user);
    
    res.json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        access_level: user.access_level
      }
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }
    
    const decoded = verifyToken(token);
    res.json({ success: true, user: decoded });
    
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;
