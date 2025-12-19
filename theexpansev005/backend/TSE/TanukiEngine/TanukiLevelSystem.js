import generateHexId from '../../utils/hexIdGenerator.js';
import pool from '../../db/pool.js';

export default class TanukiLevelSystem {
  constructor() {}

  async updateLevel(characterId, previousLevel, newLevel, triggerSource = "unknown") {
    try {
      const historyId = await generateHexId("tanuki_level_history_id");

      const delta = Number((newLevel - previousLevel).toFixed(3));

      const insertHistory = `
        INSERT INTO tanukilevelhistory
          (historyid, characterid, previouslevel, newlevel, delta, triggeredby)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

      await pool.query(insertHistory, [
        historyId,
        characterId,
        previousLevel,
        newLevel,
        delta,
        triggerSource
      ]);

      const updateProfile = `
        UPDATE user_tanuki_profile
        SET current_tanuki_level = $1,
            total_interactions = total_interactions + 1,
            updated_at = NOW()
        WHERE character_id = $2
      `;

      await pool.query(updateProfile, [newLevel, characterId]);

      return { historyId, newLevel, delta };
    } catch (err) {
      console.error("TanukiLevelSystem updateLevel error:", err.message);
      return null;
    }
  }
}
