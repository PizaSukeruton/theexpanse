import bcrypt from 'bcryptjs';
import pool from '../db/pool.js';

/**
 * User Management Module
 * Handles user authentication and management
 * Created: November 6, 2025
 * Security Fix #4
 */

class UserManager {
    /**
     * Create a new user
     */
    static async createUser(username, email, password, role = 'user') {
        try {
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // Insert user into database
            const query = `
                INSERT INTO users (username, email, password_hash, role)
                VALUES ($1, $2, $3, $4)
                RETURNING user_id, username, email, role, created_at
            `;
            
            const result = await pool.query(query, [username, email, passwordHash, role]);
            const user = result.rows[0];
            
            console.log(`[SUCCESS] User created: ${username} (${role})`);
            return { success: true, user };
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                if (error.constraint === 'users_username_key') {
                    return { success: false, error: 'Username already exists' };
                }
                if (error.constraint === 'users_email_key') {
                    return { success: false, error: 'Email already exists' };
                }
            }
            console.error('Error creating user:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verify user credentials
     */
    static async verifyUser(username, password) {
        try {
            // Get user from database
            const query = `
                SELECT user_id, username, email, password_hash, role, is_active, access_level, approval_status
                FROM users
                WHERE username = $1 OR email = $1
            `;
            
            const result = await pool.query(query, [username]);
            
            if (result.rows.length === 0) {
                return { success: false, error: 'User not found' };
            }
            
            const user = result.rows[0];
            
            // Check if account is active
            if (!user.is_active) {
                return { success: false, error: 'Account is disabled' };
            }
            
            // Check if account is approved
            if (user.approval_status !== 'approved') {
                return { success: false, error: 'Account pending approval' };
            }

            // Verify password
            const isValid = await bcrypt.compare(password, user.password_hash);
            
            if (!isValid) {
                return { success: false, error: 'Invalid password' };
            }
            
            // Update last login
            await pool.query(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
                [user.user_id]
            );
            
            // Remove password hash from response
            delete user.password_hash;
            
            return { success: true, user };
        } catch (error) {
            console.error('Error verifying user:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Change user password
     */
    static async changePassword(userId, oldPassword, newPassword) {
        try {
            // Get current password hash
            const result = await pool.query(
                'SELECT password_hash FROM users WHERE user_id = $1',
                [userId]
            );
            
            if (result.rows.length === 0) {
                return { success: false, error: 'User not found' };
            }
            
            // Verify old password
            const isValid = await bcrypt.compare(oldPassword, result.rows[0].password_hash);
            
            if (!isValid) {
                return { success: false, error: 'Current password is incorrect' };
            }
            
            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(newPassword, salt);
            
            // Update password
            await pool.query(
                'UPDATE users SET password_hash = $1 WHERE user_id = $2',
                [passwordHash, userId]
            );
            
            return { success: true, message: 'Password updated successfully' };
        } catch (error) {
            console.error('Error changing password:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user by ID
     */
    static async getUserById(userId) {
        try {
            const result = await pool.query(
                'SELECT user_id, username, email, role, access_level, approval_status, created_at, last_login, is_active FROM users WHERE user_id = $1',
                [userId]
            );
            
            if (result.rows.length === 0) {
                return null;
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }
}

export default UserManager;
