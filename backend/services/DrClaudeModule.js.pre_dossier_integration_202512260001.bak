import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';
import padEstimator from './padEstimator.js';
import PsychicEngine from '../../psychic-engine/engine.js';
import learningDetector from './learningDetector.js';

const psychicEngine = new PsychicEngine();

class DrClaudeModule {
  constructor() {
    this.CLAUDE_ID = '#700002';
    this.engine = psychicEngine;
    
    this.DECAY_THRESHOLDS = {
      positive_p: 0.3,
      negative_p: -0.3,
      high_arousal: 0.5
    };
    
    this.HALF_LIFE = {
      baseline: 300,
      positive: 600,
      negative: 900
    };
    
    this.DELTA_THRESHOLD = 0.02;
  }

  normalizeHexId(id) {
    if (!id) return null;
    return id.startsWith('#') ? id : '#' + id;
  }

  async processUserInput(userInput, userCharacterId, userId = null) {
    const charId = this.normalizeHexId(userCharacterId);
    const uId = this.normalizeHexId(userId);

    if (!charId) {
      return { skipped: true, reason: 'no_character_id' };
    }

    const padResult = padEstimator.estimate(userInput);
    
    if (padResult.coverage === 0) {
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

    const learningResult = await learningDetector.detectLearningOpportunity(userInput, charId);

    const currentPad = await this.getUserCurrentPad(charId);

    const delta = {
      p: detectedPad.p - currentPad.p,
      a: detectedPad.a - currentPad.a,
      d: detectedPad.d - currentPad.d
    };

    const hasMeaningfulDelta = 
      Math.abs(delta.p) > this.DELTA_THRESHOLD ||
      Math.abs(delta.a) > this.DELTA_THRESHOLD ||
      Math.abs(delta.d) > this.DELTA_THRESHOLD;

    if (!hasMeaningfulDelta) {
      return {
        detectedPad,
        currentPad,
        coverage: padResult.coverage,
        skipped: true,
        reason: 'delta_below_threshold',
        learningOpportunity: learningResult
      };
    }

    const halfLife = this.calculateHalfLife(detectedPad);

    const eventId = await this.createPsychicEvent({
      targetCharacter: charId,
      sourceCharacter: charId,
      eventType: 'conversation_input',
      delta,
      halfLife
    });

    const padLog = detectedPad.p.toFixed(2) + ', ' + detectedPad.a.toFixed(2) + ', ' + detectedPad.d.toFixed(2);
    console.log('[DrClaudeModule] Event ' + eventId + ' | PAD: (' + padLog + ') | Half-life: ' + halfLife + 's');

    await this.engine.processCharacter(charId);

    const updatedPad = await this.getUserCurrentPad(charId);

    if (uId) {
      await this.updateDossierPad(uId, charId, updatedPad);
    }

    return {
      detectedPad,
      updatedPad,
      delta,
      halfLife,
      eventId,
      coverage: padResult.coverage,
      skipped: false,
      learningOpportunity: learningResult
    };
  }

  calculateHalfLife(pad) {
    const { p, a } = pad;
    
    if (p < this.DECAY_THRESHOLDS.negative_p || a > this.DECAY_THRESHOLDS.high_arousal) {
      return this.HALF_LIFE.negative;
    }
    
    if (p > this.DECAY_THRESHOLDS.positive_p) {
      return this.HALF_LIFE.positive;
    }
    
    return this.HALF_LIFE.baseline;
  }

  async getUserCurrentPad(characterId) {
    const result = await pool.query(
      'SELECT p, a, d FROM psychic_moods WHERE character_id = $1',
      [characterId]
    );

    if (result.rows.length === 0) {
      return { p: 0, a: 0, d: 0 };
    }

    return {
      p: Number(result.rows[0].p) || 0,
      a: Number(result.rows[0].a) || 0,
      d: Number(result.rows[0].d) || 0
    };
  }

  async createPsychicEvent({ targetCharacter, sourceCharacter, eventType, delta, halfLife }) {
    const eventId = await generateHexId('psychic_event_id');

    await pool.query(
      'INSERT INTO psychic_events (event_id, event_type, source_character, target_character, delta_p, delta_a, delta_d, half_life_seconds, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())',
      [
        eventId,
        eventType,
        sourceCharacter,
        targetCharacter,
        Number(delta.p.toFixed(2)),
        Number(delta.a.toFixed(2)),
        Number(delta.d.toFixed(2)),
        halfLife
      ]
    );

    return eventId;
  }

  async updateDossierPad(userId, characterId, pad) {
    try {
      const padSnapshot = {
        p: Number(pad.p.toFixed(3)),
        a: Number(pad.a.toFixed(3)),
        d: Number(pad.d.toFixed(3)),
        timestamp: new Date().toISOString()
      };

      const dossierId = await generateHexId('dossier_id');
      
      const result = await pool.query(
        'INSERT INTO cotw_dossiers (dossier_id, user_id, character_id, pad_snapshot, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) ON CONFLICT (user_id, character_id) DO UPDATE SET pad_snapshot = $4, updated_at = NOW() RETURNING dossier_id',
        [dossierId, userId, characterId, JSON.stringify(padSnapshot)]
      );

      if (result.rows.length > 0) {
        console.log('[DrClaudeModule] Dossier ' + result.rows[0].dossier_id + ' PAD updated');
      }

    } catch (error) {
      console.error('[DrClaudeModule] Dossier update error:', error.message);
    }
  }
}

export default new DrClaudeModule();
