import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';
import ObjectInfluenceComputer from './ObjectInfluenceComputer.js';

class GiftEventHandler {
  constructor() {
    this.objectInfluenceComputer = new ObjectInfluenceComputer();
  }

  /**
   * Handle gift received event
   * Creates psychic event with emotional spike based on omiyage comfort
   */
  async handleGiftReceived(receiverId, giverId, objectId) {
    try {
      // 1. Get receiver's omiyage_receiving_comfort
      const receiverQuery = `
        SELECT omiyage_receiving_comfort 
        FROM character_profiles 
        WHERE character_id = $1
      `;
      const receiverResult = await pool.query(receiverQuery, [receiverId]);
      const receiverComfort = parseFloat(receiverResult.rows[0]?.omiyage_receiving_comfort || 50);

      // 2. Get object's energy signature
      const objectQuery = `
        SELECT p, a, d, object_name 
        FROM objects 
        WHERE object_id = $1
      `;
      const objectResult = await pool.query(objectQuery, [objectId]);
      const object = objectResult.rows[0];

      if (!object) {
        throw new Error(`Object ${objectId} not found`);
      }

      // 3. Calculate spike deltas
      const spike = this._calculateGiftSpike(object, receiverComfort);

      // 4. Create psychic event
      await this._createPsychicEvent(receiverId, giverId, spike, {
        event_type: 'gift_received',
        object_id: objectId,
        object_name: object.object_name
      });

      // 5. Recompute object influence for receiver
      await this.objectInfluenceComputer.computeObjectInfluence(receiverId);

      console.log(`Gift received: ${receiverId} from ${giverId} - Spike: p=${spike.delta_p}, a=${spike.delta_a}, d=${spike.delta_d}`);

      return spike;
    } catch (error) {
      console.error('Error handling gift received:', error);
      throw error;
    }
  }

  /**
   * Handle gift given event
   * Creates smaller spike for giver based on giving_affinity
   */
  async handleGiftGiven(giverId, receiverId, objectId) {
    try {
      // 1. Get giver's omiyage_giving_affinity
      const giverQuery = `
        SELECT omiyage_giving_affinity 
        FROM character_profiles 
        WHERE character_id = $1
      `;
      const giverResult = await pool.query(giverQuery, [giverId]);
      const givingAffinity = parseFloat(giverResult.rows[0]?.omiyage_giving_affinity || 50);

      // 2. Get object's energy signature
      const objectQuery = `
        SELECT p, a, d, object_name 
        FROM objects 
        WHERE object_id = $1
      `;
      const objectResult = await pool.query(objectQuery, [objectId]);
      const object = objectResult.rows[0];

      // 3. Calculate giver spike (scaled by affinity)
      const spike = this._calculateGiverSpike(object, givingAffinity);

      // 4. Create psychic event (giver affects themselves)
      await this._createPsychicEvent(giverId, giverId, spike, {
        event_type: 'gift_given',
        receiver_id: receiverId,
        object_id: objectId,
        object_name: object.object_name
      });

      console.log(`Gift given: ${giverId} to ${receiverId} - Spike: p=${spike.delta_p}, a=${spike.delta_a}, d=${spike.delta_d}`);

      return spike;
    } catch (error) {
      console.error('Error handling gift given:', error);
      throw error;
    }
  }

  /**
   * Handle theft event
   * Creates negative spike for victim, complex spike for thief
   */
  async handleTheft(thiefId, victimId, objectId) {
    try {
      // Get object
      const objectQuery = `
        SELECT p, a, d, object_name 
        FROM objects 
        WHERE object_id = $1
      `;
      const objectResult = await pool.query(objectQuery, [objectId]);
      const object = objectResult.rows[0];

      // Victim spike - negative pleasure, high arousal (anger), low dominance (powerless)
      const victimSpike = {
        delta_p: -0.8,
        delta_a: 0.7,
        delta_d: -0.6,
        half_life_seconds: 900  // 15 minutes - longer lasting anger
      };

      await this._createPsychicEvent(victimId, thiefId, victimSpike, {
        event_type: 'theft_victim',
        object_id: objectId,
        object_name: object.object_name
      });

      // Thief spike - object's pleasure scaled down, high arousal (thrill), high dominance
      const thiefSpike = {
        delta_p: parseFloat(object.p) * 0.6,  // 60% of object's pleasure (guilt factor)
        delta_a: 0.8,  // Thrill of theft
        delta_d: 0.7,  // Empowerment
        half_life_seconds: 300  // 5 minutes - guilt sets in faster
      };

      await this._createPsychicEvent(thiefId, victimId, thiefSpike, {
        event_type: 'theft_perpetrator',
        object_id: objectId,
        object_name: object.object_name
      });

      // Recompute object influence for thief
      await this.objectInfluenceComputer.computeObjectInfluence(thiefId);

      console.log(`Theft: ${thiefId} stole from ${victimId}`);

      return { victimSpike, thiefSpike };
    } catch (error) {
      console.error('Error handling theft:', error);
      throw error;
    }
  }

  /**
   * Calculate gift spike for receiver
   * Formula from brief: 
   * - gift_scale = 0.5 + 0.5 * (comfort/100)
   * - delta_p = object.p * gift_scale
   * - delta_a = object.a * (0.3 + 0.7 * comfort/100)
   * - delta_d = object.d * 0.4
   */
  _calculateGiftSpike(object, receiverComfort) {
    const comfortFactor = receiverComfort / 100;
    const giftScale = 0.5 + 0.5 * comfortFactor;

    const delta_p = parseFloat(object.p || 0) * giftScale;
    const delta_a = parseFloat(object.a || 0) * (0.3 + 0.7 * comfortFactor);
    const delta_d = parseFloat(object.d || 0) * 0.4;

    return {
      delta_p: parseFloat(delta_p.toFixed(3)),
      delta_a: parseFloat(delta_a.toFixed(3)),
      delta_d: parseFloat(delta_d.toFixed(3)),
      half_life_seconds: 300  // 5 minutes default
    };
  }

  /**
   * Calculate spike for giver
   * Scaled by giving_affinity - generous people feel better giving
   */
  _calculateGiverSpike(object, givingAffinity) {
    const affinityFactor = givingAffinity / 100;

    // Giver gets positive feelings scaled by their affinity
    const delta_p = 0.5 * affinityFactor;  // Max +0.5 pleasure
    const delta_a = 0.3 * affinityFactor;  // Mild excitement
    const delta_d = 0.4 * affinityFactor;  // Feels good to give

    return {
      delta_p: parseFloat(delta_p.toFixed(3)),
      delta_a: parseFloat(delta_a.toFixed(3)),
      delta_d: parseFloat(delta_d.toFixed(3)),
      half_life_seconds: 300  // 5 minutes
    };
  }

  /**
   * Create psychic event in database
   * Note: psychic_events uses source_character and target_character, not character_id
   */
  async _createPsychicEvent(targetCharacter, sourceCharacter, spike, metadata) {
    const eventId = await generateHexId('psychic_event_id');

    const query = `
      INSERT INTO psychic_events (
        event_id,
        source_character,
        target_character,
        event_type,
        delta_p,
        delta_a,
        delta_d,
        half_life_seconds,
        influence_data,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      eventId,
      sourceCharacter,
      targetCharacter,
      metadata.event_type,
      spike.delta_p,
      spike.delta_a,
      spike.delta_d,
      spike.half_life_seconds,
      JSON.stringify(metadata)
    ]);

    return result.rows[0];
  }
}

export default GiftEventHandler;
