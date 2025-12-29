import pool from '../db/pool.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import generateHexId from './hexIdGenerator.js';
import { sendVerificationEmail } from './emailSender.js';

// Input normalization helpers
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function normalizeUsername(username) {
  return username.trim();
}

// Validation helpers
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username) {
  const normalized = normalizeUsername(username);
  return normalized.length >= 3 && normalized.length <= 32 && /^[a-zA-Z0-9_-]+$/.test(normalized);
}

export async function registerUser(email, username) {
  try {
    // Normalize inputs
    const emailNorm = normalizeEmail(email);
    const usernameNorm = normalizeUsername(username);

    // Validate inputs
    if (!isValidEmail(emailNorm)) {
      return { success: false, error: 'Invalid email address', code: 'INVALID_EMAIL' };
    }

    if (!isValidUsername(usernameNorm)) {
      return { success: false, error: 'Username must be 3-32 characters, alphanumeric with underscore/hyphen', code: 'INVALID_USERNAME' };
    }

    // Check for duplicates in pending_registrations
    const pendingEmail = await pool.query(
      'SELECT registration_id FROM pending_registrations WHERE LOWER(email) = LOWER($1)',
      [emailNorm]
    );
    const pendingUsername = await pool.query(
      'SELECT registration_id FROM pending_registrations WHERE LOWER(username) = LOWER($1)',
      [usernameNorm]
    );

    if (pendingEmail.rows.length > 0 && pendingUsername.rows.length > 0) {
      return { success: false, error: 'Email and username already registered', code: 'EMAIL_AND_USERNAME_REGISTERED' };
    } else if (pendingEmail.rows.length > 0) {
      return { success: false, error: 'Email already registered', code: 'EMAIL_REGISTERED' };
    } else if (pendingUsername.rows.length > 0) {
      return { success: false, error: 'Username already registered', code: 'USERNAME_REGISTERED' };
    }

    // Check for duplicates in users table
    const userEmail = await pool.query(
      'SELECT user_id FROM users WHERE LOWER(email) = LOWER($1)',
      [emailNorm]
    );
    const userUsername = await pool.query(
      'SELECT user_id FROM users WHERE LOWER(username) = LOWER($1)',
      [usernameNorm]
    );

    if (userEmail.rows.length > 0 && userUsername.rows.length > 0) {
      return { success: false, error: 'Email and username already exist', code: 'EMAIL_AND_USERNAME_EXISTS' };
    } else if (userEmail.rows.length > 0) {
      return { success: false, error: 'Email already exists', code: 'EMAIL_EXISTS' };
    } else if (userUsername.rows.length > 0) {
      return { success: false, error: 'Username already exists', code: 'USERNAME_EXISTS' };
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Insert into pending_registrations with database-managed expiry
    // No password stored - user will set password during verification
    await pool.query(
      `INSERT INTO pending_registrations (email, username, verification_token, token_expires_at, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours', NOW() + INTERVAL '7 days')`,
      [emailNorm, usernameNorm, verificationToken]
    );

    // Generate verification link
    const baseUrl = process.env.VERIFICATION_BASE_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/terminal_new_v003.html?verify=${verificationToken}`;

    // Send verification email
    await sendVerificationEmail(emailNorm, usernameNorm, verificationLink);

    return { success: true, message: 'Verification email sent. Check your inbox.', code: 'VERIFICATION_EMAIL_SENT' };

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle database constraint violations
    if (error.code === '23505') {
      return { success: false, error: 'Email or username already exists', code: 'CONSTRAINT_VIOLATION' };
    }
    
    return { success: false, error: 'Registration failed', code: 'REGISTRATION_FAILED' };
  }
}

export async function verifyEmailAndSetPassword(verificationToken, password) {
  try {
    // Look up pending registration
    const result = await pool.query(
      `SELECT registration_id, email, username 
       FROM pending_registrations 
       WHERE verification_token = $1 
       AND token_expires_at > NOW() 
       AND expires_at > NOW()`,
      [verificationToken]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'Invalid or expired verification link', code: 'INVALID_TOKEN' };
    }

    const pending = result.rows[0];
    const userId = await generateHexId('user_id');

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Begin transaction
    await pool.query('BEGIN');

    try {
      // Insert new user with hashed password
      await pool.query(
        `INSERT INTO users (user_id, email, username, password_hash, approval_status, email_verified, password_set_at, access_level, user_tier, account_created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [userId, pending.email, pending.username, passwordHash, 'approved', true, new Date(), 1, 1, new Date()]
      );

      // Delete from pending_registrations
      await pool.query(
        'DELETE FROM pending_registrations WHERE registration_id = $1',
        [pending.registration_id]
      );

      // Commit transaction
      await pool.query('COMMIT');

      return { 
        success: true, 
        message: 'Account created successfully. Welcome!', 
        code: 'EMAIL_VERIFIED',
        user: { user_id: userId, username: pending.username, email: pending.email, access_level: 1 } 
      };

    } catch (innerError) {
      await pool.query('ROLLBACK');
      throw innerError;
    }

  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, error: 'Verification failed', code: 'VERIFICATION_FAILED' };
  }
}
