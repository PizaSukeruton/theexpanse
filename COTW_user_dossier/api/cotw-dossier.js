import express from 'express';
import pool from '../../backend/db/pool.js';

const router = express.Router();

const requireInternalAccess = (req, res, next) => {
  const key = req.headers['x-internal-service'];
  if (key !== 'claude' && key !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

const validateHexUserId = (req, res, next) => {
  const { userId } = req.query;
  if (!userId || !/^#[0-9A-Fa-f]{6}$/.test(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }
  next();
};

router.get(
  '/',
  requireInternalAccess,
  validateHexUserId,
  async (req, res) => {
    const start = Date.now();
    const { userId } = req.query;

    try {
      const coreResult = await pool.query(
        'SELECT * FROM cotw_core_identity_view WHERE user_id = $1',
        [userId]
      );

      if (coreResult.rows.length === 0) {
        return res.status(404).json({
          error: 'User or dossier not found',
          timestamp: new Date().toISOString()
        });
      }

      const core = coreResult.rows[0];

      if (!core.dossier_id || !core.character_id) {
        return res.status(500).json({
          error: 'Incomplete core identity',
          timestamp: new Date().toISOString()
        });
      }

      const { dossier_id, character_id } = core;

      const [
        relationships,
        traits,
        knowledge,
        inventory,
        narrative
      ] = await Promise.all([
        pool.query(
          'SELECT * FROM cotw_relationship_state_view WHERE dossier_id = $1',
          [dossier_id]
        ),
        pool.query(
          'SELECT * FROM cotw_character_traits_view WHERE character_id = $1',
          [character_id]
        ),
        pool.query(
          'SELECT * FROM cotw_knowledge_summary_view WHERE character_id = $1',
          [character_id]
        ),
        pool.query(
          'SELECT * FROM cotw_inventory_state_view WHERE character_id = $1',
          [character_id]
        ),
        pool.query(
          'SELECT * FROM cotw_narrative_state_view WHERE user_id = $1',
          [userId]
        )
      ]);

      const psychicEvents = await pool.query(
        'SELECT * FROM psychic_events WHERE dossier_id = $1 ORDER BY created_at DESC LIMIT 50',
        [dossier_id]
      );

      const conversations = await pool.query(
        'SELECT * FROM conversations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
        [userId]
      );

      res.json({
        success: true,
        userId,
        dossierId: dossier_id,
        characterId: character_id,
        dossier: {
          core,
          relationships: relationships.rows,
          traits: traits.rows,
          knowledge: knowledge.rows,
          inventory: inventory.rows,
          narrative: narrative.rows,
          psychic_events: psychicEvents.rows,
          conversations: conversations.rows
        },
        durationMs: Date.now() - start,
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      console.error('[COTW DOSSIER]', {
        userId,
        message: err.message,
        stack: err.stack?.slice(0, 500)
      });

      res.status(500).json({
        error: 'Dossier fetch failed',
        timestamp: new Date().toISOString()
      });
    }
  }
);

export default router;
