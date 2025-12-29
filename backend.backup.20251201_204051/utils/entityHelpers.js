import pool from '../db/pool.js';
import generateHexId from './hexIdGenerator.js';

/**
 * entityHelpers.js
 * 
 * Safe wrapper functions for entities table operations.
 * All functions enforce realm_hex_id filtering to prevent data leakage.
 * 
 * Implements research findings from Intent-Matching-System-2025-Updated.md:
 * - Explicit realm isolation (no RLS)
 * - Three-tier entity matching (Exact → Phonetic → Fuzzy)
 * - PostgreSQL phonetic functions (soundex, metaphone, dmetaphone)
 * - Confidence scoring for result ranking
 */

// ============================================
// INSERT ENTITY
// ============================================

/**
 * Insert a new entity into the entities table
 * Automatically generates entity_id and computes phonetic codes via PostgreSQL
 * 
 * @param {Object} params - Entity parameters
 * @param {string} params.realm_hex_id - Realm ID (required, e.g., '#F00000')
 * @param {string} params.entity_type - Entity type (required, e.g., 'PERSON', 'KNOWLEDGE')
 * @param {string} params.category - Character category (optional, e.g., 'Protagonist', 'B-Roll Chaos')
 * @param {string} params.entity_name - Display name (required)
 * @param {string} params.source_table - Source table name (optional, e.g., 'character_profiles')
 * @param {string} params.source_hex_id - Source record hex ID (optional)
 * @param {string} params.search_context - Additional searchable context (optional)
 * @returns {Promise<Object>} The created entity record
 */
export async function insertEntity({
  realm_hex_id,
  entity_type,
  category = null,
  entity_name,
  source_table = null,
  source_hex_id = null,
  search_context = null
}) {
  // Validation
  if (!realm_hex_id || !realm_hex_id.startsWith('#')) {
    throw new Error('realm_hex_id is required and must start with #');
  }
  if (!entity_type) {
    throw new Error('entity_type is required');
  }
  if (!entity_name) {
    throw new Error('entity_name is required');
  }

  try {
    // Generate new entity_id
    const entity_id = await generateHexId('entity_id');
    
    // Normalize name for searching
    const entity_name_normalized = entity_name.toLowerCase().trim();
    
    // Insert with PostgreSQL computing phonetic codes
    // Cast to VARCHAR to avoid type inference issues
    const query = `
      INSERT INTO entities (
        entity_id,
        realm_hex_id,
        entity_type,
        category,
        entity_name,
        entity_name_normalized,
        phonetic_soundex,
        phonetic_metaphone,
        phonetic_dmetaphone,
        phonetic_dmetaphone_alt,
        source_table,
        source_hex_id,
        search_context,
        created_at,
        updated_at
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6::VARCHAR,
        soundex($6::VARCHAR),
        metaphone($6::VARCHAR, 16),
        dmetaphone($6::VARCHAR),
        dmetaphone_alt($6::VARCHAR),
        $7,
        $8,
        $9,
        NOW(),
        NOW()
      )
      RETURNING *;
    `;
    
    const values = [
      entity_id,
      realm_hex_id,
      entity_type,
      category,
      entity_name,
      entity_name_normalized,
      source_table,
      source_hex_id,
      search_context
    ];
    
    const result = await pool.query(query, values);
    
    return {
      success: true,
      entity: result.rows[0]
    };
    
  } catch (error) {
    console.error('Error inserting entity:', error);
    throw error;
  }
}

// ============================================
// TIER 1: EXACT MATCH
// ============================================

/**
 * Find entity by exact name match (case-insensitive)
 * Tier 1: Fastest search (~5ms)
 * 
 * @param {string} entityName - Name to search for
 * @param {string} realm_hex_id - Realm to search in (required for isolation)
 * @param {string} entityType - Optional entity type filter
 * @returns {Promise<Object|null>} Match result or null
 */
export async function findEntityExact(entityName, realm_hex_id, entityType = null) {
  if (!realm_hex_id || !realm_hex_id.startsWith('#')) {
    throw new Error('realm_hex_id is required and must start with #');
  }
  if (!entityName) {
    throw new Error('entityName is required');
  }

  try {
    const normalized = entityName.toLowerCase().trim();
    
    let query = `
      SELECT 
        entity_id,
        entity_name,
        entity_type,
        category,
        source_table,
        source_hex_id,
        search_context
      FROM entities
      WHERE realm_hex_id = $1
        AND entity_name_normalized = $2
    `;
    
    const values = [realm_hex_id, normalized];
    
    if (entityType) {
      query += ' AND entity_type = $3';
      values.push(entityType);
    }
    
    query += ' LIMIT 5';
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      matches: result.rows,
      method: 'exact',
      confidence: 1.0,
      count: result.rows.length
    };
    
  } catch (error) {
    console.error('Error in findEntityExact:', error);
    throw error;
  }
}

// ============================================
// TIER 2: PHONETIC MATCH
// ============================================

/**
 * Find entity by phonetic similarity (sounds-like matching)
 * Tier 2: Fast search (~20ms)
 * Handles: "Steven" → "Stephen", "Pizza Skeleton" → "Piza Sukeruton"
 * 
 * @param {string} entityName - Name to search for
 * @param {string} realm_hex_id - Realm to search in (required for isolation)
 * @param {string} entityType - Optional entity type filter
 * @returns {Promise<Object|null>} Match result with confidence scores or null
 */
export async function findEntityPhonetic(entityName, realm_hex_id, entityType = null) {
  if (!realm_hex_id || !realm_hex_id.startsWith('#')) {
    throw new Error('realm_hex_id is required and must start with #');
  }
  if (!entityName) {
    throw new Error('entityName is required');
  }

  try {
    const normalized = entityName.toLowerCase().trim();
    
    // Build query with phonetic matching and confidence scoring
    let query = `
      SELECT 
        entity_id,
        entity_name,
        entity_type,
        category,
        source_table,
        source_hex_id,
        search_context,
        CASE
          WHEN phonetic_dmetaphone = dmetaphone($2) THEN 0.95
          WHEN phonetic_dmetaphone_alt = dmetaphone_alt($2) THEN 0.90
          WHEN phonetic_metaphone = metaphone($2, 16) THEN 0.88
          WHEN phonetic_soundex = soundex($2) THEN 0.85
          ELSE 0.80
        END as confidence
      FROM entities
      WHERE realm_hex_id = $1
        AND (
          phonetic_dmetaphone = dmetaphone($2)
          OR phonetic_dmetaphone_alt = dmetaphone_alt($2)
          OR phonetic_metaphone = metaphone($2, 16)
          OR phonetic_soundex = soundex($2)
        )
    `;
    
    const values = [realm_hex_id, normalized];
    
    if (entityType) {
      query += ' AND entity_type = $3';
      values.push(entityType);
    }
    
    query += ' ORDER BY confidence DESC LIMIT 5';
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      matches: result.rows,
      method: 'phonetic',
      confidence: result.rows[0].confidence,
      count: result.rows.length
    };
    
  } catch (error) {
    console.error('Error in findEntityPhonetic:', error);
    throw error;
  }
}

// ============================================
// TIER 3: FUZZY MATCH
// ============================================

/**
 * Find entity by fuzzy/trigram similarity (typo-tolerant matching)
 * Tier 3: Medium speed search (~50ms)
 * Handles: "Piza Sukerutn" → "Piza Sukeruton", "Chees Fang" → "Cheese Fang"
 * 
 * @param {string} entityName - Name to search for
 * @param {string} realm_hex_id - Realm to search in (required for isolation)
 * @param {string} entityType - Optional entity type filter
 * @param {number} threshold - Minimum similarity score (0.0-1.0, default 0.3)
 * @returns {Promise<Object|null>} Match result with similarity scores or null
 */
export async function findEntityFuzzy(entityName, realm_hex_id, entityType = null, threshold = 0.3) {
  if (!realm_hex_id || !realm_hex_id.startsWith('#')) {
    throw new Error('realm_hex_id is required and must start with #');
  }
  if (!entityName) {
    throw new Error('entityName is required');
  }

  try {
    const normalized = entityName.toLowerCase().trim();
    
    let query = `
      SELECT 
        entity_id,
        entity_name,
        entity_type,
        category,
        source_table,
        source_hex_id,
        search_context,
        similarity(entity_name_normalized, $2) as confidence
      FROM entities
      WHERE realm_hex_id = $1
        AND similarity(entity_name_normalized, $2) > $3
    `;
    
    const values = [realm_hex_id, normalized, threshold];
    
    if (entityType) {
      query += ' AND entity_type = $4';
      values.push(entityType);
    }
    
    query += ' ORDER BY confidence DESC LIMIT 5';
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      matches: result.rows,
      method: 'fuzzy',
      confidence: result.rows[0].confidence,
      count: result.rows.length
    };
    
  } catch (error) {
    console.error('Error in findEntityFuzzy:', error);
    throw error;
  }
}

// ============================================
// REVERSE LOOKUP (SOURCE TO ENTITY)
// ============================================

/**
 * Find entity record by its source table and ID
 * Useful for getting entity_id from character_id, etc.
 * 
 * @param {string} source_table - Source table name (e.g., 'character_profiles')
 * @param {string} source_hex_id - Source record hex ID (e.g., '#700001')
 * @param {string} realm_hex_id - Optional realm filter for safety
 * @returns {Promise<Object|null>} Entity record or null
 */
export async function findEntityBySource(source_table, source_hex_id, realm_hex_id = null) {
  if (!source_table || !source_hex_id) {
    throw new Error('source_table and source_hex_id are required');
  }

  try {
    let query = `
      SELECT 
        entity_id,
        realm_hex_id,
        entity_name,
        entity_type,
        category,
        source_table,
        source_hex_id,
        search_context
      FROM entities
      WHERE source_table = $1
        AND source_hex_id = $2
    `;
    
    const values = [source_table, source_hex_id];
    
    if (realm_hex_id) {
      query += ' AND realm_hex_id = $3';
      values.push(realm_hex_id);
    }
    
    query += ' LIMIT 1';
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
    
  } catch (error) {
    console.error('Error in findEntityBySource:', error);
    throw error;
  }
}

// ============================================
// GET ALL ENTITIES IN REALM
// ============================================

/**
 * Get all entities in a specific realm
 * Useful for admin/debugging
 * 
 * @param {string} realm_hex_id - Realm to query
 * @param {string} entityType - Optional type filter
 * @param {number} limit - Max results (default 100)
 * @returns {Promise<Array>} Array of entity records
 */
export async function getAllEntitiesInRealm(realm_hex_id, entityType = null, limit = 100) {
  if (!realm_hex_id || !realm_hex_id.startsWith('#')) {
    throw new Error('realm_hex_id is required and must start with #');
  }

  try {
    let query = `
      SELECT 
        entity_id,
        entity_name,
        entity_type,
        category,
        source_table,
        source_hex_id,
        search_context,
        created_at
      FROM entities
      WHERE realm_hex_id = $1
    `;
    
    const values = [realm_hex_id];
    
    if (entityType) {
      query += ' AND entity_type = $2';
      values.push(entityType);
    }
    
    query += ` ORDER BY entity_name LIMIT $${values.length + 1}`;
    values.push(limit);
    
    const result = await pool.query(query, values);
    
    return result.rows;
    
  } catch (error) {
    console.error('Error in getAllEntitiesInRealm:', error);
    throw error;
  }
}

// ============================================
// DELETE ENTITY
// ============================================

/**
 * Delete an entity by ID
 * Safety: Requires realm_hex_id to prevent accidental cross-realm deletion
 * 
 * @param {string} entity_id - Entity ID to delete
 * @param {string} realm_hex_id - Realm ID (required for safety)
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteEntity(entity_id, realm_hex_id) {
  if (!entity_id || !entity_id.startsWith('#')) {
    throw new Error('entity_id is required and must start with #');
  }
  if (!realm_hex_id || !realm_hex_id.startsWith('#')) {
    throw new Error('realm_hex_id is required and must start with #');
  }

  try {
    const query = `
      DELETE FROM entities
      WHERE entity_id = $1
        AND realm_hex_id = $2
      RETURNING entity_id;
    `;
    
    const result = await pool.query(query, [entity_id, realm_hex_id]);
    
    return result.rowCount > 0;
    
  } catch (error) {
    console.error('Error in deleteEntity:', error);
    throw error;
  }
}

// ============================================
// UPDATE ENTITY
// ============================================

/**
 * Update entity name and recompute phonetic codes
 * Safety: Requires realm_hex_id to prevent accidental cross-realm updates
 * 
 * @param {string} entity_id - Entity ID to update
 * @param {string} realm_hex_id - Realm ID (required for safety)
 * @param {Object} updates - Fields to update
 * @param {string} updates.entity_name - New name (optional)
 * @param {string} updates.category - New category (optional)
 * @param {string} updates.search_context - New context (optional)
 * @returns {Promise<Object>} Updated entity record
 */
export async function updateEntity(entity_id, realm_hex_id, updates) {
  if (!entity_id || !entity_id.startsWith('#')) {
    throw new Error('entity_id is required and must start with #');
  }
  if (!realm_hex_id || !realm_hex_id.startsWith('#')) {
    throw new Error('realm_hex_id is required and must start with #');
  }
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('updates object is required');
  }

  try {
    const setClauses = [];
    const values = [entity_id, realm_hex_id];
    let valueIndex = 3;
    
    if (updates.entity_name) {
      const normalized = updates.entity_name.toLowerCase().trim();
      setClauses.push(`entity_name = $${valueIndex}`);
      values.push(updates.entity_name);
      valueIndex++;
      
      setClauses.push(`entity_name_normalized = $${valueIndex}`);
      values.push(normalized);
      valueIndex++;
      
      // Recompute phonetic codes
      setClauses.push(`phonetic_soundex = soundex($${valueIndex - 1})`);
      setClauses.push(`phonetic_metaphone = metaphone($${valueIndex - 1}, 16)`);
      setClauses.push(`phonetic_dmetaphone = dmetaphone($${valueIndex - 1})`);
      setClauses.push(`phonetic_dmetaphone_alt = dmetaphone_alt($${valueIndex - 1})`);
    }
    
    if (updates.category !== undefined) {
      setClauses.push(`category = $${valueIndex}`);
      values.push(updates.category);
      valueIndex++;
    }
    
    if (updates.search_context !== undefined) {
      setClauses.push(`search_context = $${valueIndex}`);
      values.push(updates.search_context);
      valueIndex++;
    }
    
    setClauses.push(`updated_at = NOW()`);
    
    const query = `
      UPDATE entities
      SET ${setClauses.join(', ')}
      WHERE entity_id = $1
        AND realm_hex_id = $2
      RETURNING *;
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error(`Entity ${entity_id} not found in realm ${realm_hex_id}`);
    }
    
    return result.rows[0];
    
  } catch (error) {
    console.error('Error in updateEntity:', error);
    throw error;
  }
}
