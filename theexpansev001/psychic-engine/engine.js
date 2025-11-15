import pool from '../backend/db/pool.js';
import { upsertMood } from "./mood-smoother.js"
import { spreadEmotion } from "./contagion.js"
import generateHexId from '../backend/utils/hexIdGenerator.js';
import EmptySlotPopulator from '../backend/knowledge/EmptySlotPopulator.js';
import knowledgeQueries from '../backend/db/knowledgeQueries.js';

class PsychicEngine {
  constructor() {
    this.emptySlotPopulator = new EmptySlotPopulator();
    this.MAX_ALPHA = 0.4;  // Objects can shift up to 40% from trait baseline
    this.SATURATION_RATE = 0.5;  // k value for diminishing returns
  }

  async generateFrameId() {
    return await generateHexId('conversation_id');
  }

  async getCharacterTraits(characterId) {
  const qStart1 = Date.now();
    const result = await pool.query(
      'SELECT trait_hex_color, percentile_score FROM character_trait_scores WHERE character_hex_id = $1',
      [characterId]
    );
    return result.rows;
  console.log("[ENGINE] pool.query line 20 took", Date.now() - qStart1, "ms");
  }

  /**
   * Get object aura (persistent influence from owned objects)
   */
  async getObjectAura(characterId) {
    const query = `
      SELECT p_obj, a_obj, d_obj, total_weight 
      FROM character_object_influence 
      WHERE character_id = $1
    `;
    const result = await pool.query(query, [characterId]);
    
    if (result.rows.length === 0) {
      return { p_obj: 0, a_obj: 0, d_obj: 0, total_weight: 0 };
    }
    
    return {
      p_obj: parseFloat(result.rows[0].p_obj || 0),
      a_obj: parseFloat(result.rows[0].a_obj || 0),
      d_obj: parseFloat(result.rows[0].d_obj || 0),
      total_weight: parseFloat(result.rows[0].total_weight || 0)
    };
  }

  /**
   * Calculate influence factor (diminishing returns)
   * Formula: alpha = MAX_ALPHA * (1 - e^(-k * totalWeight))
   */
  calculateInfluenceFactor(totalWeight) {
    return this.MAX_ALPHA * (1 - Math.exp(-this.SATURATION_RATE * totalWeight));
  }

  /**
   * Get event spike (decaying influence from recent events)
   */
  async getEventSpike(characterId) {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now - 30 * 60 * 1000);
    
    const query = `
      SELECT delta_p, delta_a, delta_d, half_life_seconds, created_at
      FROM psychic_events
      WHERE target_character = $1 
      AND created_at > $2
      AND (delta_p IS NOT NULL OR delta_a IS NOT NULL OR delta_d IS NOT NULL)
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [characterId, thirtyMinutesAgo]);
    
    let p_ev = 0, a_ev = 0, d_ev = 0;
    
    for (const event of result.rows) {
      const ageSeconds = (now - new Date(event.created_at)) / 1000;
      const tau = event.half_life_seconds / Math.log(2);
      const decay = Math.exp(-ageSeconds / tau);
      
      p_ev += (parseFloat(event.delta_p) || 0) * decay;
      a_ev += (parseFloat(event.delta_a) || 0) * decay;
      d_ev += (parseFloat(event.delta_d) || 0) * decay;
    }
    
    return { 
      p_ev: parseFloat(p_ev.toFixed(3)), 
      a_ev: parseFloat(a_ev.toFixed(3)), 
      d_ev: parseFloat(d_ev.toFixed(3)) 
    };
  }

  async calculateEmotionalState(characterId) {
    const traits = await this.getCharacterTraits(characterId);
    
    if (traits.length === 0) {
      console.log(`  No traits found for ${characterId}`);
      return null;
    }

    // 1. Baseline from traits
    const avgScore = traits.reduce((sum, t) => sum + parseFloat(t.percentile_score), 0) / traits.length;
    const p_trait = (avgScore - 50) / 50;
    const a_trait = 0.5;
    const d_trait = (avgScore - 50) / 50;

    // 2. Object aura (persistent influence)
    const objectAura = await this.getObjectAura(characterId);
    const alpha = this.calculateInfluenceFactor(objectAura.total_weight);
    
    const p_persist = (1 - alpha) * p_trait + alpha * objectAura.p_obj;
    const a_persist = (1 - alpha) * a_trait + alpha * objectAura.a_obj;
    const d_persist = (1 - alpha) * d_trait + alpha * objectAura.d_obj;

    // 3. Event spikes (decaying)
    const eventSpike = await this.getEventSpike(characterId);

    // 4. Combine and clamp to [-1, 1]
    const emotional_state = {
      p: Math.max(-1, Math.min(1, p_persist + eventSpike.p_ev)),
      a: Math.max(-1, Math.min(1, a_persist + eventSpike.a_ev)),
      d: Math.max(-1, Math.min(1, d_persist + eventSpike.d_ev))
    };

    return emotional_state;
  }

  async saveFrame(characterId, emotionalState) {
    const frameId = await this.generateFrameId();
    
    await pool.query(
      'INSERT INTO psychic_frames (frame_id, character_id, emotional_state) VALUES ($1, $2, $3)',
      [frameId, characterId, JSON.stringify(emotionalState)]
    );
    
    await upsertMood({ characterId, p: emotionalState.p, a: emotionalState.a, d: emotionalState.d });
    await spreadEmotion(characterId, emotionalState);
    return frameId;
  }

  async checkKnowledgeSlotClaiming(characterId) {
    try {
      // Only check B-Roll autonomous characters
      const profile = await knowledgeQueries.getCharacterProfile(characterId);
      if (!profile || !profile.is_b_roll_autonomous) {
        return;
      }

      // Get character trait scores as object
      const traits = await this.getCharacterTraits(characterId);
      const traitScores = {};
      traits.forEach(t => {
        traitScores[t.trait_hex_color] = parseFloat(t.percentile_score);
      });

      // Get all domains and check each one
      const domainsResult = await pool.query('SELECT domain_id FROM knowledge_domains WHERE is_active = true');
      
      for (const domain of domainsResult.rows) {
        await this.emptySlotPopulator.attemptPopulateEmptySlot(
          characterId,
          domain.domain_id,
          traitScores
        );
      }
    } catch (error) {
      console.error(`Error checking knowledge slots for ${characterId}:`, error);
    }
  }

  async processCharacter(characterId) {
    const emotionalState = await this.calculateEmotionalState(characterId);
    
    if (emotionalState) {
      const frameId = await this.saveFrame(characterId, emotionalState);
      console.log(`  Saved frame ${frameId} with state: { p: ${emotionalState.p.toFixed(3)}, a: ${emotionalState.a.toFixed(3)}, d: ${emotionalState.d.toFixed(3)} }`);
      
      // Check if character should claim knowledge slots
      await this.checkKnowledgeSlotClaiming(characterId);
    }
  }
}

export default PsychicEngine;
