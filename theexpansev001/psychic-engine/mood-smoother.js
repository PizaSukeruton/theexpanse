import pool from '../backend/db/pool.js'
import generateHexId from '../backend/utils/hexIdGenerator.js'

export async function upsertMood ({ characterId, p, a, d }) {
  const moodId = await generateHexId('conversation_id')
  await pool.query(
    `INSERT INTO psychic_moods (mood_id, character_id, p, a, d)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (character_id)
     DO UPDATE SET
       p = EXCLUDED.p,
       a = EXCLUDED.a,
       d = EXCLUDED.d,
       sample_count = psychic_moods.sample_count + 1,
       updated_at = CURRENT_TIMESTAMP`,
    [moodId, characterId, p, a, d]
  )
}
