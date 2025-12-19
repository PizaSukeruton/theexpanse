import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

export async function upsertDossierForUser(userId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userRes = await client.query(
      `SELECT owned_character_id
       FROM users
       WHERE user_id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const ownedCharacterId = userRes.rows[0].owned_character_id;
    if (!ownedCharacterId) {
      await client.query('ROLLBACK');
      return null;
    }

    const frameRes = await client.query(
      `SELECT frame_id, emotional_state
       FROM psychic_frames
       WHERE character_id = $1
       
       LIMIT 1`,
      [ownedCharacterId]
    );

    const lastFrame = frameRes.rows[0] || null;
    const padSnapshot = lastFrame ? lastFrame.emotional_state : null;
    const lastFrameId = lastFrame ? lastFrame.frame_id : null;

    const dossierRes = await client.query(
      `SELECT dossier_id
       FROM cotw_dossiers
       WHERE user_id = $1 AND character_id = $2`,
      [userId, ownedCharacterId]
    );

    const now = new Date();

    if (dossierRes.rows.length === 0) {
      const dossierId = await generateHexId('dossier_id');

      await client.query(
        `INSERT INTO cotw_dossiers (
           dossier_id,
           user_id,
           character_id,
           last_psychic_frame_id,
           pad_snapshot,
           created_at,
           updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $6)`,
        [dossierId, userId, ownedCharacterId, lastFrameId, padSnapshot, now]
      );

      await client.query('COMMIT');
      return dossierId;
    } else {
      const dossierId = dossierRes.rows[0].dossier_id;

      await client.query(
        `UPDATE cotw_dossiers
         SET last_psychic_frame_id = $1,
             pad_snapshot = $2,
             updated_at = $3
         WHERE dossier_id = $4`,
        [lastFrameId, padSnapshot, now, dossierId]
      );

      await client.query('COMMIT');
      return dossierId;
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('cotwDossierService.upsertDossierForUser error:', err);
    throw err;
  } finally {
    client.release();
  }
}
