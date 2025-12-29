import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';
import padEstimator from './padEstimator.js';
import DossierUpdater from './DossierUpdater.js';

class DrClaudeModule {
  constructor() {
    this.CLAUDE_ID = '#700002';
    
    // Half-life thresholds (Verduyn et al.)
    this.DECAY_THRESHOLDS = {
      positive_p: 0.3,    // Joy/Relief
      negative_p: -0.3,   // Distress/Anger
      high_arousal: 0.5   // High energy
    };
    
    // Decay rates in seconds
    this.HALF_LIFE = {
      baseline: 300,      // 5 min
      positive: 600,      // 10 min
      negative: 900       // 15 min
    };

    // Smoothing factor: Higher = more reactive, Lower = more stable
    this.EMA_ALPHA = 0.50; 
  }

  /**
   * Main Pipeline: Detect -> Smooth -> Update -> Event -> Dossier
   * This runs on every user message *before* Claude responds.
   */
  async processUserInput(userInput, userCharacterId, userId = null) {
    // 1. ESTIMATE: Get raw PAD data from text
    const padResult = padEstimator.estimate(userInput);
    
    // If text has no emotional content, return early
    if (padResult.coverage === 0) {
      return { skipped: true, reason: 'no_emotional_content' };
    }

    const detectedPad = {
      p: padResult.pad.pleasure,
      a: padResult.pad.arousal,
      d: padResult.pad.dominance
    };

    // 2. FETCH: Get the user's previous state
    const currentPad = await this.getUserCurrentPad(userCharacterId);

    // 3. SMOOTH: Apply Exponential Moving Average (EMA)
    // New = (Alpha * Detected) + ((1 - Alpha) * Old)
    const newPad = {
        p: (this.EMA_ALPHA * detectedPad.p) + ((1 - this.EMA_ALPHA) * currentPad.p),
        a: (this.EMA_ALPHA * detectedPad.a) + ((1 - this.EMA_ALPHA) * currentPad.a),
        d: (this.EMA_ALPHA * detectedPad.d) + ((1 - this.EMA_ALPHA) * currentPad.d)
    };

    // 4. DELTA: Calculate change for the event log
    const delta = {
      p: newPad.p - currentPad.p,
      a: newPad.a - currentPad.a,
      d: newPad.d - currentPad.d
    };

    // Gate: Ignore microscopic changes to reduce database noise
    const JITTER_THRESHOLD = 0.01;
    if (Math.abs(delta.p) < JITTER_THRESHOLD && 
        Math.abs(delta.a) < JITTER_THRESHOLD && 
        Math.abs(delta.d) < JITTER_THRESHOLD) {
        return { skipped: true, reason: 'negligible_change', currentPad };
    }

    // 5. UPDATE: Write new state to DB (Psychic Moods)
    await this.updateUserMood(userCharacterId, newPad);
    
    // 6. SNAPSHOT: Create historical frame
    const frameId = await this.createPsychicFrame(userCharacterId, newPad);

    // 7. EVENT: Log the specific interaction spike
    const halfLife = this.calculateHalfLife(newPad);
    const eventId = await this.createPsychicEvent({
      targetCharacter: userCharacterId,
      sourceCharacter: this.CLAUDE_ID,
      eventType: 'user_message',
      delta,
      halfLife,
      frameId
    });

    // 8. UPDATE DOSSIER (Phase 4 Integration)
    if (userId) {
        try {
            await DossierUpdater.processUpdate(userId, userCharacterId, newPad, delta);
        } catch (dossierErr) {
            console.error('[DrClaude] Dossier update skipped:', dossierErr.message);
        }
    }

    console.log(`[DrClaude] Updated ${userCharacterId}: PAD(${newPad.p.toFixed(2)}, ${newPad.a.toFixed(2)}, ${newPad.d.toFixed(2)})`);

    return {
      success: true,
      updatedPad: newPad, // Correctly mapped for ClaudeBrain
      newPad,
      delta,
      eventId,
      frameId
    };
  }

  calculateHalfLife(pad) {
    if (pad.p < this.DECAY_THRESHOLDS.negative_p || pad.a > this.DECAY_THRESHOLDS.high_arousal) {
      return this.HALF_LIFE.negative;
    }
    if (pad.p > this.DECAY_THRESHOLDS.positive_p) {
      return this.HALF_LIFE.positive;
    }
    return this.HALF_LIFE.baseline;
  }

  async getUserCurrentPad(characterId) {
    const result = await pool.query(
      'SELECT p, a, d FROM psychic_moods WHERE character_id = $1',
      [characterId]
    );
    
    if (result.rows.length === 0) return { p: 0, a: 0, d: 0 };
    
    return {
      p: parseFloat(result.rows[0].p),
      a: parseFloat(result.rows[0].a),
      d: parseFloat(result.rows[0].d)
    };
  }

  async updateUserMood(characterId, pad) {
      await pool.query(
          `UPDATE psychic_moods 
           SET p = $1, a = $2, d = $3, updated_at = NOW(), sample_count = sample_count + 1
           WHERE character_id = $4`,
           [pad.p, pad.a, pad.d, characterId]
      );
  }

  async createPsychicFrame(characterId, pad) {
      const frameId = await generateHexId('psychic_frame_id');
      await pool.query(
          `INSERT INTO psychic_frames (frame_id, character_id, timestamp, emotional_state)
           VALUES ($1, $2, NOW(), $3)`,
           [frameId, characterId, JSON.stringify(pad)]
      );
      return frameId;
  }

  async createPsychicEvent({ targetCharacter, sourceCharacter, eventType, delta, halfLife, frameId }) {
    const eventId = await generateHexId('psychic_event_id');
    const influenceData = JSON.stringify({ delta });
    
    await pool.query(
      `INSERT INTO psychic_events 
       (event_id, event_type, source_character, target_character, delta_p, delta_a, delta_d, half_life_seconds, frame_id, influence_data, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [eventId, eventType, sourceCharacter, targetCharacter, delta.p, delta.a, delta.d, halfLife, frameId, influenceData]
    );
    return eventId;
  }
}

export default new DrClaudeModule();
