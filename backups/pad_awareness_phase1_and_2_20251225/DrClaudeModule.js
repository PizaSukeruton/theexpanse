import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';
import padEstimator from './padEstimator.js';
import PsychicEngine from '../../psychic-engine/engine.js';

class DrClaudeModule {
  constructor() {
    this.CLAUDE_ID = '#700002';
    this.engine = new PsychicEngine();
    
    // Half-life thresholds (Verduyn et al.)
    this.DECAY_THRESHOLDS = {
      positive_p: 0.3,
      negative_p: -0.3,
      high_arousal: 0.5
    };
    
    // Half-life values in seconds
    this.HALF_LIFE = {
      baseline: 300,   // 5 min - near neutral
      positive: 600,   // 10 min - joy fades faster
      negative: 900    // 15 min - distress lingers
    };
    
    // Delta threshold to avoid noise
    this.DELTA_THRESHOLD = 0.02;
  }

  /**
   * Process user message: detect PAD, create event, trigger engine
   * @param {string} userInput - The user's message text
   * @param {string} userCharacterId - The user's character hex ID
   * @returns {object} - Detection results for ClaudeBrain
   */
  async processUserInput(userInput, userCharacterId) {
    // 1. Estimate PAD from text
    const padResult = padEstimator.estimate(userInput);
    
    if (padResult.coverage === 0) {
      console.log(`[DrClaudeModule] No emotional content for ${userCharacterId}`);
      return {
        detectedPad: null,
        coverage: 0,
        skipped: true,
        reason: 'no_emotional_content'
      };
    }

    const detectedPad = {
      p: padResult.pad.pleasure,
      a: padResult.pad.arousal,
      d: padResult.pad.dominance
    };

    // 2. Fetch current PAD (read-only)
    const currentPad = await this.getUserCurrentPad(userCharacterId);

    // 3. Calculate delta
    const delta = {
      p: detectedPad.p - currentPad.p,
      a: detectedPad.a - currentPad.a,
      d: detectedPad.d - currentPad.d
    };

    // 4. Check if delta is meaningful
    const hasMeaningfulDelta = 
      Math.abs(delta.p) > this.DELTA_THRESHOLD ||
      Math.abs(delta.a) > this.DELTA_THRESHOLD ||
      Math.abs(delta.d) > this.DELTA_THRESHOLD;

    if (!hasMeaningfulDelta) {
      console.log(`[DrClaudeModule] Delta below threshold for ${userCharacterId}`);
      return {
        detectedPad,
        currentPad,
        coverage: padResult.coverage,
        skipped: true,
        reason: 'delta_below_threshold'
      };
    }

    // 5. Calculate half-life based on detected emotion
    const halfLife = this.calculateHalfLife(detectedPad);

    // 6. Create psychic_event (source = user, target = user)
    const eventId = await this.createPsychicEvent({
      targetCharacter: userCharacterId,
      sourceCharacter: userCharacterId,  // User caused their own emotion
      eventType: 'conversation_input',
      delta,
      halfLife
    });

    console.log(`[DrClaudeModule] Event ${eventId} | PAD: (${detectedPad.p.toFixed(2)}, ${detectedPad.a.toFixed(2)}, ${detectedPad.d.toFixed(2)}) | Half-life: ${halfLife}s`);

    // 7. Trigger engine to process this character immediately
    await this.engine.processCharacter(userCharacterId);

    // 8. Fetch updated PAD after engine processing
    const updatedPad = await this.getUserCurrentPad(userCharacterId);

    return {
      detectedPad,
      updatedPad,
      delta,
      halfLife,
      eventId,
      coverage: padResult.coverage,
      skipped: false
    };
  }

  /**
   * Calculate half-life based on detected PAD
   */
  calculateHalfLife(pad) {
    const { p, a } = pad;
    
    // Negative emotion OR high arousal = slow decay
    if (p < this.DECAY_THRESHOLDS.negative_p || a > this.DECAY_THRESHOLDS.high_arousal) {
      return this.HALF_LIFE.negative;
    }
    
    // Positive emotion = medium decay
    if (p > this.DECAY_THRESHOLDS.positive_p) {
      return this.HALF_LIFE.positive;
    }
    
    // Near baseline = fast decay
    return this.HALF_LIFE.baseline;
  }

  /**
   * Get user's current PAD (read-only)
   */
  async getUserCurrentPad(characterId) {
    const result = await pool.query(
      'SELECT p, a, d FROM psychic_moods WHERE character_id = $1',
      [characterId]
    );

    if (result.rows.length === 0) {
      return { p: 0, a: 0, d: 0 };
    }

    return {
      p: parseFloat(result.rows[0].p) || 0,
      a: parseFloat(result.rows[0].a) || 0,
      d: parseFloat(result.rows[0].d) || 0
    };
  }

  /**
   * Create psychic_event (the only write this module does)
   */
  async createPsychicEvent({ targetCharacter, sourceCharacter, eventType, delta, halfLife }) {
    const eventId = await generateHexId('psychic_event_id');

    await pool.query(
      `INSERT INTO psychic_events 
       (event_id, event_type, source_character, target_character, delta_p, delta_a, delta_d, half_life_seconds, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        eventId,
        eventType,
        sourceCharacter,
        targetCharacter,
        delta.p.toFixed(2),
        delta.a.toFixed(2),
        delta.d.toFixed(2),
        halfLife
      ]
    );

    return eventId;
  }
}

export default new DrClaudeModule();
