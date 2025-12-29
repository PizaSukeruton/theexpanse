import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

class UserPadInitializer {
  constructor() {
    this.CLAUDE_ID = '#700002';
    this.PAD_DEFAULT = { p: 0.0, a: 0.0, d: 0.0 };
    this.PROXIMITY_DEFAULT = { distance: 0.5, resonance: 0.5 };
    this.TRAIT_DEFAULT_PERCENTILE = 50;
    this.EMA_ALPHA = 0.20;
  }

  async initializeUser(userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userRes = await client.query(
        'SELECT owned_character_id FROM users WHERE user_id = $1 FOR UPDATE',
        [userId]
      );

      if (userRes.rows.length === 0 || !userRes.rows[0].owned_character_id) {
        throw new Error(`User ${userId} has no owned character`);
      }

      const charId = userRes.rows[0].owned_character_id;
      console.log(`[UserPadInitializer] Initializing character ${charId} for user ${userId}`);

      await this.initializeMood(client, charId);
      await this.initializeTraits(client, charId);
      await this.initializeProximity(client, charId);
      await this.initializeDossier(client, userId, charId);

      await client.query('COMMIT');
      console.log(`[UserPadInitializer] Complete for ${userId}`);
      return { success: true, characterId: charId };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`[UserPadInitializer] Failed for ${userId}:`, error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  async initializeMood(client, charId) {
    const existing = await client.query(
      'SELECT mood_id FROM psychic_moods WHERE character_id = $1',
      [charId]
    );

    if (existing.rows.length > 0) {
      console.log(`  - Mood already exists, skipping`);
      return;
    }

    const moodId = await generateHexId('conversation_id');
    await client.query(
      `INSERT INTO psychic_moods (mood_id, character_id, p, a, d, alpha, sample_count, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 1, NOW())`,
      [moodId, charId, this.PAD_DEFAULT.p, this.PAD_DEFAULT.a, this.PAD_DEFAULT.d, this.EMA_ALPHA]
    );
    console.log(`  - Created mood ${moodId}`);
  }

  async initializeTraits(client, charId) {
    const countRes = await client.query(
      'SELECT COUNT(*) FROM character_trait_scores WHERE character_hex_id = $1',
      [charId]
    );

    const expectedCountRes = await client.query(
      `SELECT COUNT(*) FROM characteristics 
       WHERE category IN ('Emotional', 'Cognitive', 'Social', 'Behavioral', 'Specialized')
       AND hex_color IS NOT NULL`
    );

    const existingCount = parseInt(countRes.rows[0].count);
    const expectedCount = parseInt(expectedCountRes.rows[0].count);

    if (existingCount >= expectedCount) {
      console.log(`  - Traits already exist (${existingCount}/${expectedCount}), skipping`);
      return;
    }

    const traitsRes = await client.query(
      `SELECT hex_color FROM characteristics 
       WHERE category IN ('Emotional', 'Cognitive', 'Social', 'Behavioral', 'Specialized')
       AND hex_color IS NOT NULL`
    );

    let attempted = 0;
    for (const trait of traitsRes.rows) {
      await client.query(
        `INSERT INTO character_trait_scores (character_hex_id, trait_hex_color, percentile_score, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (character_hex_id, trait_hex_color) DO NOTHING`,
        [charId, trait.hex_color, this.TRAIT_DEFAULT_PERCENTILE]
      );
      attempted++;
    }
    console.log(`  - Trait initialization attempted for ${attempted} traits (${existingCount} pre-existing)`);
  }

  async initializeProximity(client, charId) {
    const existing = await client.query(
      `SELECT proximity_id FROM psychic_proximity 
       WHERE (character_a = $1 AND character_b = $2) 
          OR (character_a = $2 AND character_b = $1)`,
      [charId, this.CLAUDE_ID]
    );

    if (existing.rows.length > 0) {
      console.log(`  - Proximity to Claude already exists, skipping`);
      return;
    }

    const proxId = await generateHexId('psychic_proximity_id');
    await client.query(
      `INSERT INTO psychic_proximity 
       (proximity_id, character_a, character_b, psychological_distance, emotional_resonance, last_interaction)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [proxId, charId, this.CLAUDE_ID, this.PROXIMITY_DEFAULT.distance, this.PROXIMITY_DEFAULT.resonance]
    );
    console.log(`  - Created proximity ${proxId} to Claude`);
  }

  async initializeDossier(client, userId, charId) {
    const existing = await client.query(
      'SELECT dossier_id FROM cotw_dossiers WHERE user_id = $1 AND character_id = $2',
      [userId, charId]
    );

    if (existing.rows.length > 0) {
      console.log(`  - Dossier already exists, skipping`);
      return;
    }

    const dossierId = await generateHexId('dossier_id');
    await client.query(
      `INSERT INTO cotw_dossiers (dossier_id, user_id, character_id, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())`,
      [dossierId, userId, charId]
    );
    console.log(`  - Created dossier ${dossierId}`);
  }

  async backfillAllUsers() {
    console.log('[UserPadInitializer] Starting backfill for all users...');
    
    const users = await pool.query(
      'SELECT user_id FROM users WHERE owned_character_id IS NOT NULL'
    );

    const results = { success: 0, failed: 0, errors: [] };

    for (const row of users.rows) {
      try {
        await this.initializeUser(row.user_id);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({ userId: row.user_id, error: error.message });
      }
    }

    console.log(`[UserPadInitializer] Backfill complete: ${results.success} success, ${results.failed} failed`);
    return results;
  }
}

export default new UserPadInitializer();
