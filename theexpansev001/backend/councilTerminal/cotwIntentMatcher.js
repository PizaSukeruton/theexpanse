import { searchEntityWithDisambiguation } from '../utils/tieredEntitySearch.js';
import { getAllEntitiesInRealm } from '../utils/entityHelpers.js';

class CotwIntentMatcher {
  constructor() {
    this.intents = {
      CAN: [
        /^can (?:you |i )(.+?)$/i,
        /^could (?:you |i )(.+?)$/i,
        /^would (?:you |i )(.+?)$/i,
        /^will (?:you |i )(.+?)$/i,
        /^please (.+?)$/i
      ],
      
      WHO: [
        /^who is (.+?)$/i,
        /^who are the (.+?)$/i,
        /^tell me about (.+?)$/i,
        /^identify (.+?)$/i,
        /^show me (.+?)$/i
      ],
      
      WHAT: [
        /^what is (.+?)$/i,
        /^what are (.+?)$/i,
        /^define (.+?)$/i,
        /^explain (.+?)$/i
      ],
      
      WHEN: [
        /^when did (.+?)$/i,
        /^when was (.+?)$/i,
        /^when will (.+?)$/i,
        /^what time (.+?)$/i
      ],
      
      WHERE: [
        /^where is (.+?)$/i,
        /^where are (.+?)$/i,
        /^where did (.+?)$/i,
        /^location of (.+?)$/i
      ],
      
      WHY: [
        /^why did (.+?)$/i,
        /^why is (.+?)$/i,
        /^why does (.+?)$/i,
        /^reason for (.+?)$/i
      ],
      
      HOW: [
        /^how does (.+?)$/i,
        /^how did (.+?)$/i,
        /^how to (.+?)$/i,
        /^how is (.+?)$/i
      ],
      
      WHICH: [
        /^which (?:character|person|entity|one) (?:is|has|was) (?:the |a |an )?(.+)$/i,
        /^which (.+)$/i
      ],
      
      IS: [
        /^is ([a-zA-Z0-9\s]+) (?:a|an|the) (.+?)$/i,
        /^are ([a-zA-Z0-9\s]+) (.+?)$/i
      ],
      
      SEARCH: [
        /^search for (.+?)$/i,
        /^find (.+?)$/i,
        /^lookup (.+?)$/i,
        /^query (.+?)$/i
      ]
    };

    this.entityCache = new Map(); // Keyed by realm_hex_id
    this.cacheTimestamps = new Map();
    this.CACHE_TTL = 300000; // 5 minutes
  }

  /**
   * Calculate realm_hex_id from user access_level
   * Level 1-10 map to #F00000-#F00009
   * Level 11 (admin) defaults to #F00000 but can be overridden via realmOverride parameter
   */
  getRealmFromAccessLevel(accessLevel, realmOverride = null) {
    if (!accessLevel || accessLevel < 1 || accessLevel > 11) {
      throw new Error(`Invalid access_level: ${accessLevel}. Must be 1-11.`);
    }
    
    // Level 11 (admin) - allow realm override, default to #F00000
    if (accessLevel === 11) {
      return realmOverride || '#F00000';
    }
    
    // Regular users map to their level's realm
    const realmNumber = accessLevel - 1;
    const hexValue = realmNumber.toString(16).toUpperCase();
    return `#F0000${hexValue}`;
  }

  async refreshEntityCache(realm_hex_id) {
    const now = Date.now();
    const lastUpdate = this.cacheTimestamps.get(realm_hex_id);
    
    if (this.entityCache.has(realm_hex_id) && lastUpdate && (now - lastUpdate) < this.CACHE_TTL) {
      return; // Cache still valid
    }

    try {
      const entities = await getAllEntitiesInRealm(realm_hex_id, null, 1000);
      this.entityCache.set(realm_hex_id, entities);
      this.cacheTimestamps.set(realm_hex_id, now);
      console.log(`✅ Entity cache refreshed for ${realm_hex_id}: ${entities.length} entities`);
    } catch (error) {
      console.error(`Failed to refresh entity cache for ${realm_hex_id}:`, error);
      this.entityCache.set(realm_hex_id, []);
    }
  }
  
  cleanQuery(query) {
    return query
      .toLowerCase()
      .trim()
      .replace(/[?!.,;:]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Match user intent from query
   * 
   * @param {string} query - User's query text
   * @param {Object} context - Session context with lastEntity, etc.
   * @param {Object} user - User object with access_level
   * @param {string} realmOverride - Optional realm override for admin users (level 11 only)
   * @returns {Promise<Object>} Intent result
   */
  async matchIntent(query, context = null, user = null, realmOverride = null) {
    if (!user || !user.access_level) {
      throw new Error('User object with access_level is required');
    }

    // Calculate user's realm (admin can override)
    const realm_hex_id = this.getRealmFromAccessLevel(user.access_level, realmOverride);
    const normalized = this.cleanQuery(query);
    
    // Refresh cache if needed
    await this.refreshEntityCache(realm_hex_id);
    
    // Handle context-aware pronouns
    if (context && context.lastEntity) {
      const pronounPatterns = /^(who|what|where|when|why|how|which|is) (?:is|was|are|were)? (?:he|she|it|they|that|this)$/i;
      if (pronounPatterns.test(normalized)) {
        const intentWord = normalized.match(/^(who|what|where|when|why|how|which|is)/i)[1].toUpperCase();
        return {
          type: intentWord,
          entity: context.lastEntity,
          confidence: 0.85,
          original: query,
          contextUsed: true,
          realm: realm_hex_id
        };
      }
    }
    
    // Handle image patterns
    if (normalized.match(/(?:show|display|see|view).*(?:picture|photo|image|pic|portrait|visual)/i)) {
      const patterns = [
        /(?:picture|photo|image|pic|portrait|visual)\s+(?:of|for)\s+(.+?)$/i,
        /(.+?)(?:'s)?\s+(?:picture|photo|image|pic|portrait|visual)$/i,
        /(?:show|display|see|view)\s+(?:me\s+)?(.+?)$/i
      ];
      
      for (const pattern of patterns) {
        const match = normalized.match(pattern);
        if (match && match[1]) {
          const entityName = match[1].trim();
          const searchResult = await searchEntityWithDisambiguation(entityName, realm_hex_id);
          
          return {
            type: 'SHOW_IMAGE',
            entity: searchResult.action === 'single_match' ? searchResult.entity.entity_name : entityName,
            entityData: searchResult.action === 'single_match' ? searchResult.entity : null,
            confidence: searchResult.confidence || 0.7,
            original: query,
            searchResult: searchResult,
            realm: realm_hex_id
          };
        }
      }
    }
    
    // Check all standard patterns
    for (const [intentType, patterns] of Object.entries(this.intents)) {
      for (const pattern of patterns) {
        const match = normalized.match(pattern);
        if (match) {
          const entity = match[1] ? match[1].trim().replace(/[?!.,;:]+$/, '') : null;
          
          if (entity) {
            const searchResult = await searchEntityWithDisambiguation(entity, realm_hex_id);
            
            return {
              type: intentType,
              entity: searchResult.action === 'single_match' ? searchResult.entity.entity_name : entity,
              entityData: searchResult.action === 'single_match' ? searchResult.entity : null,
              confidence: searchResult.confidence || 0.7,
              original: query,
              searchResult: searchResult,
              realm: realm_hex_id
            };
          }
        }
      }
    }
    
    // Fallback search
    const searchResult = await searchEntityWithDisambiguation(normalized, realm_hex_id);
    
    return {
      type: 'SEARCH',
      entity: searchResult.action === 'single_match' ? searchResult.entity.entity_name : normalized,
      entityData: searchResult.action === 'single_match' ? searchResult.entity : null,
      confidence: searchResult.confidence || 0.5,
      original: query,
      searchResult: searchResult,
      realm: realm_hex_id
    };
  }
}

export default new CotwIntentMatcher();
