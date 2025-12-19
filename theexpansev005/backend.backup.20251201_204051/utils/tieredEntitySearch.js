import {
  findEntityExact,
  findEntityPhonetic,
  findEntityFuzzy
} from './entityHelpers.js';

/**
 * tieredEntitySearch.js
 * 
 * Orchestrates cascading entity search through three tiers:
 * Tier 1: Exact match (fastest, ~5ms)
 * Tier 2: Phonetic match (fast, ~20ms) 
 * Tier 3: Fuzzy match (medium, ~50ms)
 * 
 * Implements early stopping: returns immediately when match found.
 * 
 * Based on research from Intent-Matching-System-2025-Updated.md:
 * - 60% of queries resolve at Tier 1
 * - 25% at Tier 2
 * - 12% at Tier 3
 * - 3% no match
 */

/**
 * Search for entity using cascading tier strategy
 * Stops at first tier that returns results
 * 
 * @param {string} entityName - Name to search for
 * @param {string} realm_hex_id - Realm to search in (required for isolation)
 * @param {Object} options - Search options
 * @param {string} options.entityType - Optional entity type filter
 * @param {number} options.fuzzyThreshold - Minimum similarity for fuzzy (default 0.3)
 * @param {boolean} options.skipPhonetic - Skip tier 2 (default false)
 * @param {boolean} options.skipFuzzy - Skip tier 3 (default false)
 * @returns {Promise<Object>} Search result with matches and metadata
 */
export async function searchEntity(entityName, realm_hex_id, options = {}) {
  if (!entityName) {
    throw new Error('entityName is required');
  }
  if (!realm_hex_id || !realm_hex_id.startsWith('#')) {
    throw new Error('realm_hex_id is required and must start with #');
  }

  const {
    entityType = null,
    fuzzyThreshold = 0.3,
    skipPhonetic = false,
    skipFuzzy = false
  } = options;

  const startTime = Date.now();
  let result = null;

  try {
    // TIER 1: EXACT MATCH (fastest)
    result = await findEntityExact(entityName, realm_hex_id, entityType);
    if (result) {
      const latency = Date.now() - startTime;
      return {
        ...result,
        latency_ms: latency,
        tiers_searched: 1,
        query: entityName,
        realm: realm_hex_id
      };
    }

    // TIER 2: PHONETIC MATCH (handles sound-alikes)
    if (!skipPhonetic) {
      result = await findEntityPhonetic(entityName, realm_hex_id, entityType);
      if (result) {
        const latency = Date.now() - startTime;
        return {
          ...result,
          latency_ms: latency,
          tiers_searched: 2,
          query: entityName,
          realm: realm_hex_id
        };
      }
    }

    // TIER 3: FUZZY MATCH (handles typos)
    if (!skipFuzzy) {
      result = await findEntityFuzzy(entityName, realm_hex_id, entityType, fuzzyThreshold);
      if (result) {
        const latency = Date.now() - startTime;
        return {
          ...result,
          latency_ms: latency,
          tiers_searched: 3,
          query: entityName,
          realm: realm_hex_id
        };
      }
    }

    // NO MATCH FOUND
    const latency = Date.now() - startTime;
    return {
      matches: [],
      method: 'none',
      confidence: 0.0,
      count: 0,
      latency_ms: latency,
      tiers_searched: skipFuzzy ? (skipPhonetic ? 1 : 2) : 3,
      query: entityName,
      realm: realm_hex_id
    };

  } catch (error) {
    console.error('Error in searchEntity:', error);
    throw error;
  }
}

/**
 * Search with disambiguation handling
 * Returns structured response for multiple matches
 * 
 * @param {string} entityName - Name to search for
 * @param {string} realm_hex_id - Realm to search in
 * @param {Object} options - Search options (same as searchEntity)
 * @returns {Promise<Object>} Result with action recommendation
 */
export async function searchEntityWithDisambiguation(entityName, realm_hex_id, options = {}) {
  const result = await searchEntity(entityName, realm_hex_id, options);

  // No matches
  if (result.count === 0) {
    return {
      action: 'not_found',
      message: `No entity found matching "${entityName}" in this realm.`,
      query: entityName,
      realm: realm_hex_id,
      latency_ms: result.latency_ms
    };
  }

  // Single match with high confidence
  if (result.count === 1 && result.confidence >= 0.85) {
    return {
      action: 'single_match',
      entity: result.matches[0],
      confidence: result.confidence,
      method: result.method,
      query: entityName,
      realm: realm_hex_id,
      latency_ms: result.latency_ms
    };
  }

  // Single match with medium confidence (confirm with user)
  if (result.count === 1 && result.confidence >= 0.65) {
    return {
      action: 'confirm',
      message: `Did you mean "${result.matches[0].entity_name}"?`,
      entity: result.matches[0],
      confidence: result.confidence,
      method: result.method,
      query: entityName,
      realm: realm_hex_id,
      latency_ms: result.latency_ms
    };
  }

  // Single match with low confidence (ask for clarification)
  if (result.count === 1 && result.confidence < 0.65) {
    return {
      action: 'clarify',
      message: `I found "${result.matches[0].entity_name}" but I'm not very confident. Is that what you meant?`,
      entity: result.matches[0],
      confidence: result.confidence,
      method: result.method,
      query: entityName,
      realm: realm_hex_id,
      latency_ms: result.latency_ms
    };
  }

  // Multiple matches (2-3) - show options
  if (result.count >= 2 && result.count <= 3) {
    return {
      action: 'disambiguate',
      message: `I found ${result.count} entities. Which did you mean?`,
      options: result.matches.map((m, idx) => ({
        number: idx + 1,
        entity_id: m.entity_id,
        entity_name: m.entity_name,
        entity_type: m.entity_type,
        confidence: m.confidence || result.confidence
      })),
      method: result.method,
      query: entityName,
      realm: realm_hex_id,
      latency_ms: result.latency_ms
    };
  }

  // Too many matches (>3) - ask for more specific query
  if (result.count > 3) {
    return {
      action: 'refine',
      message: `I found ${result.count} possible matches. Can you be more specific?`,
      top_matches: result.matches.slice(0, 3).map(m => ({
        entity_name: m.entity_name,
        entity_type: m.entity_type
      })),
      method: result.method,
      query: entityName,
      realm: realm_hex_id,
      latency_ms: result.latency_ms
    };
  }

  // Fallback
  return {
    action: 'single_match',
    entity: result.matches[0],
    confidence: result.confidence,
    method: result.method,
    query: entityName,
    realm: realm_hex_id,
    latency_ms: result.latency_ms
  };
}

/**
 * Batch search multiple entities at once
 * Useful for extracting multiple entities from a query
 * 
 * @param {Array<string>} entityNames - Array of names to search
 * @param {string} realm_hex_id - Realm to search in
 * @param {Object} options - Search options (same as searchEntity)
 * @returns {Promise<Array>} Array of search results
 */
export async function batchSearchEntities(entityNames, realm_hex_id, options = {}) {
  if (!Array.isArray(entityNames) || entityNames.length === 0) {
    throw new Error('entityNames must be a non-empty array');
  }
  if (!realm_hex_id || !realm_hex_id.startsWith('#')) {
    throw new Error('realm_hex_id is required and must start with #');
  }

  try {
    const results = await Promise.all(
      entityNames.map(name => searchEntity(name, realm_hex_id, options))
    );

    return results.map((result, idx) => ({
      query: entityNames[idx],
      ...result
    }));

  } catch (error) {
    console.error('Error in batchSearchEntities:', error);
    throw error;
  }
}

/**
 * Get search statistics for monitoring
 * Tracks which tiers are being used most
 * 
 * @param {Array<Object>} searchResults - Array of previous search results
 * @returns {Object} Statistics about tier usage
 */
export function getSearchStatistics(searchResults) {
  if (!Array.isArray(searchResults) || searchResults.length === 0) {
    return {
      total_searches: 0,
      tier1_hits: 0,
      tier2_hits: 0,
      tier3_hits: 0,
      no_match: 0,
      avg_latency_ms: 0,
      tier1_percentage: 0,
      tier2_percentage: 0,
      tier3_percentage: 0
    };
  }

  const stats = {
    total_searches: searchResults.length,
    tier1_hits: 0,
    tier2_hits: 0,
    tier3_hits: 0,
    no_match: 0,
    total_latency: 0
  };

  searchResults.forEach(result => {
    if (result.count > 0) {
      if (result.tiers_searched === 1) stats.tier1_hits++;
      else if (result.tiers_searched === 2) stats.tier2_hits++;
      else if (result.tiers_searched === 3) stats.tier3_hits++;
    } else {
      stats.no_match++;
    }
    stats.total_latency += result.latency_ms || 0;
  });

  return {
    total_searches: stats.total_searches,
    tier1_hits: stats.tier1_hits,
    tier2_hits: stats.tier2_hits,
    tier3_hits: stats.tier3_hits,
    no_match: stats.no_match,
    avg_latency_ms: Math.round(stats.total_latency / stats.total_searches),
    tier1_percentage: Math.round((stats.tier1_hits / stats.total_searches) * 100),
    tier2_percentage: Math.round((stats.tier2_hits / stats.total_searches) * 100),
    tier3_percentage: Math.round((stats.tier3_hits / stats.total_searches) * 100),
    no_match_percentage: Math.round((stats.no_match / stats.total_searches) * 100)
  };
}

/**
 * Validate search result confidence
 * Helps determine if result should be used directly or needs confirmation
 * 
 * @param {Object} searchResult - Result from searchEntity
 * @returns {Object} Validation assessment
 */
export function validateSearchConfidence(searchResult) {
  if (!searchResult || searchResult.count === 0) {
    return {
      valid: false,
      action: 'not_found',
      message: 'No matches found'
    };
  }

  const confidence = searchResult.confidence;

  if (confidence >= 0.85) {
    return {
      valid: true,
      action: 'proceed',
      message: 'High confidence match - proceed directly'
    };
  }

  if (confidence >= 0.65) {
    return {
      valid: true,
      action: 'confirm',
      message: 'Medium confidence - ask user to confirm'
    };
  }

  return {
    valid: false,
    action: 'clarify',
    message: 'Low confidence - ask user for clarification'
  };
}

/**
 * Format search result for display to user
 * Creates human-readable response
 * 
 * @param {Object} searchResult - Result from searchEntity
 * @returns {string} Formatted message
 */
export function formatSearchResult(searchResult) {
  if (!searchResult || searchResult.count === 0) {
    return `I couldn't find anything matching "${searchResult.query}".`;
  }

  const match = searchResult.matches[0];
  const methodDescription = {
    exact: 'found exactly',
    phonetic: 'found (sounds like)',
    fuzzy: 'found (close match)'
  };

  if (searchResult.count === 1) {
    const desc = methodDescription[searchResult.method] || 'found';
    return `I ${desc}: ${match.entity_name} (${match.entity_type})`;
  }

  const names = searchResult.matches.slice(0, 3).map(m => m.entity_name).join(', ');
  return `I found ${searchResult.count} matches: ${names}`;
}

/**
 * GOD MODE: Search all three tiers independently
 * Returns results from ALL tiers (no early stopping)
 * Used for Level 11 debugging to see what each tier found
 * 
 * @param {string} entityName - Name to search for
 * @param {string} realm_hex_id - Realm to search in
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Results from all three tiers
 */
export async function searchEntityAllTiers(entityName, realm_hex_id, options = {}) {
  if (!entityName) {
    throw new Error('entityName is required');
  }
  if (!realm_hex_id || !realm_hex_id.startsWith('#')) {
    throw new Error('realm_hex_id is required and must start with #');
  }

  const {
    entityType = null,
    fuzzyThreshold = 0.3
  } = options;

  const startTime = Date.now();
  const results = {
    query: entityName,
    realm: realm_hex_id,
    tier1: null,
    tier2: null,
    tier3: null,
    total_latency_ms: 0
  };

  try {
    // Run ALL three tiers (no early stopping)
    const tier1Start = Date.now();
    results.tier1 = await findEntityExact(entityName, realm_hex_id, entityType);
    results.tier1_latency_ms = Date.now() - tier1Start;

    const tier2Start = Date.now();
    results.tier2 = await findEntityPhonetic(entityName, realm_hex_id, entityType);
    results.tier2_latency_ms = Date.now() - tier2Start;

    const tier3Start = Date.now();
    results.tier3 = await findEntityFuzzy(entityName, realm_hex_id, entityType, fuzzyThreshold);
    results.tier3_latency_ms = Date.now() - tier3Start;

    results.total_latency_ms = Date.now() - startTime;

    return results;

  } catch (error) {
    console.error('Error in searchEntityAllTiers:', error);
    throw error;
  }
}
