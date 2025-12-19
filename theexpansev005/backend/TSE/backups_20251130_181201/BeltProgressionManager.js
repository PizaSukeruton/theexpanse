import generateHexId from "../utils/hexIdGenerator.js";

export default class BeltProgressionManager {
  constructor(pool) {
    this.pool = pool;
    
    // Belt Mapping:
    // 0: White
    // 1: Blue
    // 2: Purple
    // 3: Brown
    // 4: Black
    
    this.BELT_THRESHOLDS = {
      0: 300,   // XP needed to go White -> Blue
      1: 900,   // XP needed to go Blue -> Purple
      2: 1800,  // XP needed to go Purple -> Brown
      3: 3000   // XP needed to go Brown -> Black
    };
  }

  async getCurrentBelt(characterId) {
    const sql = `SELECT current_belt, xp FROM character_belts WHERE character_id = $1`;
    const res = await this.pool.query(sql, [characterId]);
    
    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0];
  }

  async applyEvaluation(characterId, avgScore) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Get current state or initialize default
      let record = await this.getCurrentBelt(characterId);
      let isNewRecord = false;

      if (!record) {
         isNewRecord = true;
         record = { current_belt: 0, xp: 0 }; // Default to White Belt (0)
      }

      // 2. Calculate XP Gain (Score 0-5 -> 0-50 XP)
      const xpGain = Math.floor(avgScore * 10);
      let newXp = record.xp + xpGain;
      let newBelt = record.current_belt;

      // 3. Check Promotion (Max belt is 4: Black)
      const nextThreshold = this.BELT_THRESHOLDS[newBelt];
      let promoted = false;

      if (nextThreshold !== undefined && newXp >= nextThreshold) {
        newBelt++;
        promoted = true;
      }

      let finalResult;

      // 4. Save to DB
      if (isNewRecord) {
          const newId = await generateHexId("belt_progression_id");
          
          const historyEntry = JSON.stringify([{
            date: new Date().toISOString(),
            xpGain,
            score: avgScore,
            promoted
          }]);

          const insertSql = `
            INSERT INTO character_belts 
            (belt_progression_id, character_id, current_belt, xp, last_promoted_at, history) 
            VALUES ($1, $2, $3, $4, NOW(), $5::jsonb)
            RETURNING current_belt, xp
          `;
          
          const res = await client.query(insertSql, [newId, characterId, newBelt, newXp, historyEntry]);
          finalResult = res.rows[0];

      } else {
          const historyEntry = JSON.stringify({
            date: new Date().toISOString(),
            xpGain,
            score: avgScore,
            promoted
          });

          const updateSql = `
            UPDATE character_belts 
            SET current_belt = $1, 
                xp = $2, 
                last_promoted_at = CASE WHEN $3 = TRUE THEN NOW() ELSE last_promoted_at END,
                history = history || $4::jsonb
            WHERE character_id = $5
            RETURNING current_belt, xp
          `;

          const res = await client.query(updateSql, [
            newBelt,
            newXp,
            promoted,
            historyEntry,
            characterId
          ]);
          finalResult = res.rows[0];
      }

      await client.query('COMMIT');

      return {
        previousBelt: record.current_belt,
        newBelt: finalResult.current_belt,
        xpGained: xpGain,
        promoted
      };

    } catch (err) {
      await client.query('ROLLBACK');
      console.error("[BeltProgression] Error:", err);
      // Fail safely so the whole TSE loop doesn't crash
      return { previousBelt: 0, newBelt: 0, xpGained: 0, promoted: false };
    } finally {
      client.release();
    }
  }
}
