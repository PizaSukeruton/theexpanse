import pool from '../db/pool.js';
import generateHexId from './hexIdGenerator.js';

export async function logAccess(userId, accessType, resource = null, ipAddress = null, userAgent = null, success = true) {
  try {
    const logId = await generateHexId('access_log_id');
    
    await pool.query(
      `INSERT INTO access_logs (log_id, user_id, access_type, resource, ip_address, user_agent, success, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [logId, userId, accessType, resource, ipAddress, userAgent, success]
    );
  } catch (error) {
    console.error('Failed to log access:', error);
  }
}

export async function getAccessLogs(userId, limit = 50) {
  try {
    const result = await pool.query(
      `SELECT log_id, user_id, access_type, resource, success, created_at
       FROM access_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Failed to retrieve access logs:', error);
    return [];
  }
}
