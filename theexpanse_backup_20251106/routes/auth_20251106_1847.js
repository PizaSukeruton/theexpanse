import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';

const router = express.Router();

// Placeholder for register (user-generated password)
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    res.json({ message: 'User registered', username });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Placeholder for login (password + optional 2FA)
router.post('/login', async (req, res) => {
  const { username, password, token } = req.body;
  try {
    const jwtToken = jwt.sign(
      { username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token: jwtToken, requires2FA: false });
  } catch (err) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Placeholder for 2FA setup
router.post('/2fa/setup', (req, res) => {
  const secret = speakeasy.generateSecret({ name: 'TheExpanse Admin' });
  res.json({
    secret: secret.base32,
    otpauth_url: secret.otpauth_url
  });
});

// Placeholder for 2FA verify
router.post('/2fa/verify', (req, res) => {
  const { userSecret, token } = req.body;
  const verified = speakeasy.totp.verify({
    secret: userSecret,
    encoding: 'base32',
    token
  });
  res.json({ valid: verified });
});

export default router;
