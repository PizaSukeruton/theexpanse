import pool from "../db/pool.js";

/**
 * ContextMemoryManager
 * Hybrid memory model:
 *  A) Per-user persistent conversation context
 *  B) Per-character persistent PAD + state memory
 *  C) Stores alias confirmations, intent chain, lastEntity, lastIntent
 */

export default class ContextMemoryManager {
  async update(session, intentResult, response, aliasUpdates) {
    try {
      if (!session?.id) return session.context || {};

      const userId = session.id;
      const oldContext = session.context || {};

      const newContext = {
        ...oldContext,
        lastCommand: response?.command || oldContext.lastCommand || null,
        lastIntent: intentResult?.type || oldContext.lastIntent || null,
        lastEntity:
          response?.data?.entity_name ||
          intentResult?.entity ||
          oldContext.lastEntity ||
          null,
        lastAction: response?.action || null,
        timestamp: Date.now()
      };

      // ------------------------------
      // ALIAS TRAINING MEMORY (optional)
      // ------------------------------
      if (aliasUpdates && aliasUpdates.alias) {
        newContext.lastAliasLearned = {
          alias: aliasUpdates.alias,
          entity: aliasUpdates.entity,
          learned: aliasUpdates.learned || false,
          updated: aliasUpdates.updated || false,
          time: Date.now()
        };
      }

      // ------------------------------
      // SAVE TO DATABASE
      // ------------------------------
      await pool.query(
        `
          INSERT INTO conversation_context
            (user_id, last_intent, last_entity, last_action, last_command, memory_json, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW())
          ON CONFLICT (user_id)
          DO UPDATE SET
            last_intent = EXCLUDED.last_intent,
            last_entity = EXCLUDED.last_entity,
            last_action = EXCLUDED.last_action,
            last_command = EXCLUDED.last_command,
            memory_json = EXCLUDED.memory_json,
            updated_at = NOW()
        `,
        [
          userId,
          newContext.lastIntent,
          newContext.lastEntity,
          newContext.lastAction,
          newContext.lastCommand,
          JSON.stringify(newContext)
        ]
      );

      return newContext;

    } catch (err) {
      console.error("[ContextMemoryManager] Error:", err);
      return session.context || {};
    }
  }
}
