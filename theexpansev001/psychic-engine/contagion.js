import pool from '../backend/db/pool.js'

export async function spreadEmotion(sourceCharacterId, emotionalState) {
  const proximityQuery = await pool.query(
    `SELECT character_b as target_id, psychological_distance
     FROM   psychic_proximity
     WHERE  character_a = $1
       AND  psychological_distance < 0.5
       AND  character_a != character_b
     UNION
     SELECT character_a as target_id, psychological_distance
     FROM   psychic_proximity
     WHERE  character_b = $1
       AND  psychological_distance < 0.5
       AND  character_a != character_b`,
    [sourceCharacterId]
  )
  
  const targets = proximityQuery.rows
  
  for (const target of targets) {
    if (target.target_id === sourceCharacterId) continue;
    
    const influence = target.psychological_distance * 0.2
    
    await pool.query(
      `UPDATE psychic_moods
       SET p = p + ($1 - p) * $2,
           a = a + ($3 - a) * $2,
           d = d + ($4 - d) * $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE character_id = $5`,
      [emotionalState.p, influence, emotionalState.a, emotionalState.d, target.target_id]
    )
  }
  
  return targets.length
}
