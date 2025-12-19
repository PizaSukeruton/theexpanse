import PsychicEngine from '../psychic-engine/engine.js';
import pool from './db/pool.js';

let updateInterval = 30000;
let engineTimer = null;

async function loadConfigFromDB() {
  try {
    const result = await pool.query(
      'SELECT config_value FROM psychic_engine_config WHERE config_key = $1',
      ['update_interval']
    );
   
    if (result.rows.length > 0) {
      const config = result.rows[0].config_value;
      updateInterval = config.milliseconds || 30000;
    }
  } catch (error) {
    console.error('Failed to load psychic engine config from DB:', error.message);
  }
}

export async function startPsychicEngine(intervalMs) {
  if (!intervalMs) {
    await loadConfigFromDB();
  } else {
    updateInterval = intervalMs;
  }
 
  if (engineTimer) clearInterval(engineTimer);
 
  console.log(`🧠 Psychic Engine starting with ${updateInterval}ms interval`);
 
  engineTimer = setInterval(async () => {
    const batchStart = Date.now();
    const engine = new PsychicEngine();
    
    try {
      const result = await pool.query(`
        SELECT character_id, character_name, category 
        FROM character_profiles 
        WHERE category != 'Knowledge Entity'
        ORDER BY character_id
      `);
      
      console.log(`\n[ENGINE] Processing ${result.rows.length} characters...`);
      
      for (const row of result.rows) {
        await engine.processCharacter(row.character_id);
      }
      
      console.log(`[ENGINE] Batch complete in ${Date.now() - batchStart}ms\n`);
    } catch (error) {
      console.error('[ENGINE] Error:', error.message);
    }
  }, updateInterval);
}

export function stopPsychicEngine() {
  if (engineTimer) {
    clearInterval(engineTimer);
    engineTimer = null;
    console.log('⏹️ Psychic Engine stopped');
  }
}

export async function setUpdateInterval(newIntervalMs) {
  updateInterval = newIntervalMs;
 
  await pool.query(
    `INSERT INTO psychic_engine_config (config_key, config_value)
    VALUES ('update_interval', $1)
    ON CONFLICT (config_key)
    DO UPDATE SET config_value = $1, updated_at = NOW()`,
    [JSON.stringify({ milliseconds: newIntervalMs })]
  );
 
  if (engineTimer) {
    stopPsychicEngine();
    await startPsychicEngine(newIntervalMs);
  }
}

export function getUpdateInterval() {
  return updateInterval;
}
