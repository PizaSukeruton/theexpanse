import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

class ObjectInfluenceComputer {
  constructor() {
    this.MAX_ALPHA = 0.4;  // Objects can shift up to 40% from trait baseline
    this.SATURATION_RATE = 0.5;  // k value for diminishing returns
  }

  /**
   * Main entry point - recompute object influence for a character
   * Called when inventory changes (gift, theft, trade, etc.)
   */
  async computeObjectInfluence(characterId) {
    try {
      // 1. Get all objects in character's inventory
      const inventory = await this._getCharacterInventory(characterId);
      
      if (inventory.length === 0) {
        // No objects - clear influence
        await this._clearObjectInfluence(characterId);
        return null;
      }

      // 2. Calculate weight for each object
      const weightedObjects = inventory.map(item => this._calculateObjectWeight(item));

      // 3. Aggregate PAD values
      const aggregatedPAD = this._aggregateObjectPAD(weightedObjects);

      // 4. Aggregate domain weights
      const domainWeights = this._aggregateDomainWeights(weightedObjects);

      // 5. Update database
      await this._updateObjectInfluence(characterId, aggregatedPAD, domainWeights);

      return aggregatedPAD;
    } catch (error) {
      console.error(`Error computing object influence for ${characterId}:`, error);
      throw error;
    }
  }

  /**
   * Get all objects in character's inventory with object details
   */
  async _getCharacterInventory(characterId) {
    const query = `
      SELECT 
        ci.inventory_entry_id,
        ci.object_id,
        ci.acquired_at,
        ci.acquisition_method,
        ci.source_character_id,
        o.object_name,
        o.p,
        o.a,
        o.d,
        o.linked_domain_id,
        o.metadata
      FROM character_inventory ci
      JOIN objects o ON ci.object_id = o.object_id
      WHERE ci.character_id = $1
    `;
    
    const result = await pool.query(query, [characterId]);
    return result.rows;
  }

  /**
   * Calculate weight for a single object
   * Formula: weight = base_weight * attunement * method_multiplier
   */
  _calculateObjectWeight(inventoryItem) {
    const now = new Date();
    const acquiredAt = new Date(inventoryItem.acquired_at);
    
    // Time-based attunement (0-1)
    const hoursOwned = (now - acquiredAt) / (1000 * 3600);
    const timeAttunement = Math.min(1, 0.5 * (hoursOwned / 24)); // +0.5 over 24 hours
    
    // Interaction-based attunement (0-0.5)
    // Check if interaction_count exists in metadata
    const interactionCount = inventoryItem.metadata?.interaction_count || 0;
    const interactionAttunement = Math.min(0.5, 0.1 * interactionCount);
    
    // Total attunement (0-1)
    const attunement = timeAttunement + interactionAttunement;
    
    // Acquisition method multiplier
    const methodMultipliers = {
      'gift': 1.0,
      'found': 0.6,
      'stolen': 0.8,
      'traded': 0.7,
      'purchased': 0.5,
      'created': 0.9,
      'inherited': 0.8,
      'conjured': 0.7
    };
    const methodMultiplier = methodMultipliers[inventoryItem.acquisition_method] || 0.5;
    
    // Base weight (currently 1.0 for all objects)
    const baseWeight = 1.0;
    
    // Final weight
    const weight = baseWeight * attunement * methodMultiplier;
    
    return {
      ...inventoryItem,
      weight,
      attunement,
      methodMultiplier
    };
  }

  /**
   * Aggregate PAD values from all weighted objects
   * Formula: p_obj = Σ(weight_i * p_i) / Σ|weight_i|
   */
  _aggregateObjectPAD(weightedObjects) {
    // Calculate total weight
    const totalWeight = weightedObjects.reduce((sum, obj) => sum + Math.abs(obj.weight), 0);
    
    if (totalWeight === 0) {
      return {
        p_obj: 0,
        a_obj: 0,
        d_obj: 0,
        total_weight: 0
      };
    }
    
    // Weighted average for each PAD dimension
    const p_obj = weightedObjects.reduce((sum, obj) => {
      return sum + (obj.weight * (parseFloat(obj.p) || 0));
    }, 0) / totalWeight;
    
    const a_obj = weightedObjects.reduce((sum, obj) => {
      return sum + (obj.weight * (parseFloat(obj.a) || 0));
    }, 0) / totalWeight;
    
    const d_obj = weightedObjects.reduce((sum, obj) => {
      return sum + (obj.weight * (parseFloat(obj.d) || 0));
    }, 0) / totalWeight;
    
    return {
      p_obj: parseFloat(p_obj.toFixed(2)),
      a_obj: parseFloat(a_obj.toFixed(2)),
      d_obj: parseFloat(d_obj.toFixed(2)),
      total_weight: parseFloat(totalWeight.toFixed(3))
    };
  }

  /**
   * Aggregate domain weights for interest boosting
   * Returns: {"#AE0002": 1.7, "#AE0005": 0.4, ...}
   */
  _aggregateDomainWeights(weightedObjects) {
    const domainWeights = {};
    
    for (const obj of weightedObjects) {
      if (obj.linked_domain_id) {
        domainWeights[obj.linked_domain_id] = 
          (domainWeights[obj.linked_domain_id] || 0) + obj.weight;
      }
    }
    
    // Round to 3 decimal places
    for (const domain in domainWeights) {
      domainWeights[domain] = parseFloat(domainWeights[domain].toFixed(3));
    }
    
    return domainWeights;
  }

  /**
   * Update or insert object influence in database
   */
  async _updateObjectInfluence(characterId, aggregatedPAD, domainWeights) {
    // Check if record exists
    const checkQuery = `
      SELECT influence_id FROM character_object_influence 
      WHERE character_id = $1
    `;
    const checkResult = await pool.query(checkQuery, [characterId]);

    if (checkResult.rows.length > 0) {
      // Update existing record
      const updateQuery = `
        UPDATE character_object_influence
        SET 
          p_obj = $2,
          a_obj = $3,
          d_obj = $4,
          total_weight = $5,
          domain_weights = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE character_id = $1
        RETURNING *;
      `;
      const result = await pool.query(updateQuery, [
        characterId,
        aggregatedPAD.p_obj,
        aggregatedPAD.a_obj,
        aggregatedPAD.d_obj,
        aggregatedPAD.total_weight,
        JSON.stringify(domainWeights)
      ]);
      return result.rows[0];
    } else {
      // Insert new record
      const influenceId = await generateHexId('character_object_influence_id');
      const insertQuery = `
        INSERT INTO character_object_influence (
          influence_id,
          character_id,
          p_obj,
          a_obj,
          d_obj,
          total_weight,
          domain_weights,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        RETURNING *;
      `;
      const result = await pool.query(insertQuery, [
        influenceId,
        characterId,
        aggregatedPAD.p_obj,
        aggregatedPAD.a_obj,
        aggregatedPAD.d_obj,
        aggregatedPAD.total_weight,
        JSON.stringify(domainWeights)
      ]);
      return result.rows[0];
    }
  }

  /**
   * Clear object influence when character has no objects
   */
  async _clearObjectInfluence(characterId) {
    const query = `
      DELETE FROM character_object_influence 
      WHERE character_id = $1
    `;
    await pool.query(query, [characterId]);
  }
}

export default ObjectInfluenceComputer;
