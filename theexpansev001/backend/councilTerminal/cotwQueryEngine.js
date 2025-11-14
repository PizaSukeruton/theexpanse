import { getAllEntitiesInRealm } from '../utils/entityHelpers.js';

/**
 * Universal Query Engine for Council Terminal
 * 
 * Processes intent results from cotwIntentMatcher.js and generates responses
 * Uses entities table with realm isolation
 * Handles all intent types: WHO, WHAT, WHICH, IS, CAN, WHEN, WHERE, WHY, HOW, SEARCH
 */

class CotwQueryEngine {
  constructor() {
    this.responseCache = new Map();
    this.CACHE_TTL = 300000; // 5 minutes
  }

  /**
   * Main query processing function
   * Takes intent result and generates appropriate response
   * 
   * @param {Object} intentResult - Result from cotwIntentMatcher.matchIntent()
   * @param {Object} user - User object with access_level
   * @returns {Promise<Object>} Response object with message and data
   */
  async processQuery(intentResult, user) {
    if (!intentResult) {
      return this.errorResponse('No intent result provided');
    }

    if (!user || !user.access_level) {
      return this.errorResponse('User object with access_level required');
    }

    const { type, searchResult, entity, entityData, realm } = intentResult;

    // Handle disambiguation cases first
    if (searchResult) {
      switch (searchResult.action) {
        case 'not_found':
          return this.notFoundResponse(entity, realm);
        
        case 'confirm':
          return this.confirmResponse(searchResult);
        
        case 'clarify':
          return this.clarifyResponse(searchResult);
        
        case 'disambiguate':
          return this.disambiguateResponse(searchResult);
        
        case 'refine':
          return this.refineResponse(searchResult);
      }
    }

    // Handle successful single match
    if (entityData) {
      return await this.handleIntentType(type, entityData, realm);
    }

    // Fallback
    return this.errorResponse('Unable to process query');
  }

  /**
   * Route to appropriate handler based on intent type
   */
  async handleIntentType(type, entityData, realm) {
    switch (type) {
      case 'WHO':
        return this.handleWho(entityData, realm);
      
      case 'WHAT':
        return this.handleWhat(entityData, realm);
      
      case 'WHICH':
        return this.handleWhich(entityData, realm);
      
      case 'IS':
        return this.handleIs(entityData, realm);
      
      case 'CAN':
        return this.handleCan(entityData, realm);
      
      case 'WHEN':
        return this.handleWhen(entityData, realm);
      
      case 'WHERE':
        return this.handleWhere(entityData, realm);
      
      case 'WHY':
        return this.handleWhy(entityData, realm);
      
      case 'HOW':
        return this.handleHow(entityData, realm);
      
      case 'SEARCH':
        return this.handleSearch(entityData, realm);
      
      case 'SHOW_IMAGE':
        return this.handleShowImage(entityData, realm);
      
      default:
        return this.errorResponse(`Unknown intent type: ${type}`);
    }
  }

  /**
   * WHO handler - Returns information about a person/character
   */
  async handleWho(entityData, realm) {
    const { entity_name, entity_type, category, search_context } = entityData;
    
    if (entity_type === 'KNOWLEDGE') {
      return {
        success: true,
        message: `${entity_name} is a concept or knowledge entity, not a person.`,
        data: entityData,
        suggestion: `Try asking "What is ${entity_name}?" instead.`
      };
    }

    let message = `${entity_name}`;
    
    if (category) {
      message += ` - ${category}`;
    }
    
    if (search_context) {
      message += `\n${search_context}`;
    }

    return {
      success: true,
      message,
      data: entityData,
      realm
    };
  }

  /**
   * WHAT handler - Returns definition/explanation
   */
  async handleWhat(entityData, realm) {
    const { entity_name, entity_type, search_context } = entityData;
    
    let message = `${entity_name}`;
    
    if (search_context) {
      message += `\n${search_context}`;
    } else {
      message += ` is a ${entity_type.toLowerCase()} in this realm.`;
    }

    return {
      success: true,
      message,
      data: entityData,
      realm
    };
  }

  /**
   * WHICH handler - Helps differentiate between options
   */
  async handleWhich(entityData, realm) {
    const { entity_name, category, entity_type, search_context } = entityData;
    
    let message = `${entity_name}`;
    
    if (category) {
      message += ` (${category})`;
    }
    
    if (search_context) {
      message += `\n${search_context}`;
    }

    return {
      success: true,
      message,
      data: entityData,
      realm
    };
  }

  /**
   * IS handler - Boolean/verification questions
   */
  async handleIs(entityData, realm) {
    const { entity_name, category, entity_type, search_context } = entityData;
    
    let message = `Yes, ${entity_name} exists in this realm.`;
    
    if (category) {
      message += ` It is classified as: ${category}`;
    }
    
    if (search_context) {
      message += `\n${search_context}`;
    }

    return {
      success: true,
      message,
      data: entityData,
      realm
    };
  }

  /**
   * CAN handler - Capability questions
   */
  async handleCan(entityData, realm) {
    return {
      success: true,
      message: `I found information about ${entityData.entity_name}. What would you like to know?`,
      data: entityData,
      realm
    };
  }

  /**
   * WHEN handler - Temporal questions
   */
  async handleWhen(entityData, realm) {
    return {
      success: true,
      message: `I found ${entityData.entity_name}. Temporal information not yet implemented.`,
      data: entityData,
      realm
    };
  }

  /**
   * WHERE handler - Location questions
   */
  async handleWhere(entityData, realm) {
    return {
      success: true,
      message: `I found ${entityData.entity_name}. Location information not yet implemented.`,
      data: entityData,
      realm
    };
  }

  /**
   * WHY handler - Reason/explanation questions
   */
  async handleWhy(entityData, realm) {
    const { entity_name, search_context } = entityData;
    
    let message = `Regarding ${entity_name}`;
    
    if (search_context) {
      message += `:\n${search_context}`;
    } else {
      message += `: Detailed explanation not yet available.`;
    }

    return {
      success: true,
      message,
      data: entityData,
      realm
    };
  }

  /**
   * HOW handler - Process/method questions
   */
  async handleHow(entityData, realm) {
    return {
      success: true,
      message: `I found ${entityData.entity_name}. Process information not yet implemented.`,
      data: entityData,
      realm
    };
  }

  /**
   * SEARCH handler - General search
   */
  async handleSearch(entityData, realm) {
    return {
      success: true,
      message: `Found: ${entityData.entity_name}`,
      data: entityData,
      realm
    };
  }

  /**
   * SHOW_IMAGE handler - Image display requests
   */
  async handleShowImage(entityData, realm) {
    if (!entityData) {
      return {
        success: false,
        message: 'Could not find entity for image display'
      };
    }

    return {
      success: true,
      message: `Displaying image for ${entityData.entity_name}`,
      data: entityData,
      realm,
      action: 'show_image'
    };
  }

  /**
   * Disambiguation response handlers
   */
  notFoundResponse(entity, realm) {
    return {
      success: false,
      message: `I couldn't find "${entity}" in this realm.`,
      realm,
      action: 'not_found'
    };
  }

  confirmResponse(searchResult) {
    return {
      success: true,
      message: searchResult.message,
      data: searchResult.entity,
      confidence: searchResult.confidence,
      realm: searchResult.realm,
      action: 'confirm'
    };
  }

  clarifyResponse(searchResult) {
    return {
      success: true,
      message: searchResult.message,
      data: searchResult.entity,
      confidence: searchResult.confidence,
      realm: searchResult.realm,
      action: 'clarify'
    };
  }

  disambiguateResponse(searchResult) {
    const optionsList = searchResult.options
      .map(opt => `${opt.number}. ${opt.entity_name} (${opt.entity_type})`)
      .join('\n');

    return {
      success: true,
      message: `${searchResult.message}\n${optionsList}`,
      options: searchResult.options,
      realm: searchResult.realm,
      action: 'disambiguate'
    };
  }

  refineResponse(searchResult) {
    const matchesList = searchResult.top_matches
      .map(m => `- ${m.entity_name} (${m.entity_type})`)
      .join('\n');

    return {
      success: true,
      message: `${searchResult.message}\n\nSome examples:\n${matchesList}`,
      realm: searchResult.realm,
      action: 'refine'
    };
  }

  errorResponse(message) {
    return {
      success: false,
      message: message || 'An error occurred processing your query'
    };
  }

  /**
   * List all entities in realm
   * Useful for "show me everything" type queries
   */
  async listAllEntities(realm_hex_id, entityType = null) {
    try {
      const entities = await getAllEntitiesInRealm(realm_hex_id, entityType, 100);
      
      if (entities.length === 0) {
        return {
          success: false,
          message: `No entities found in realm ${realm_hex_id}`,
          realm: realm_hex_id
        };
      }

      const grouped = entities.reduce((acc, entity) => {
        const type = entity.entity_type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(entity.entity_name);
        return acc;
      }, {});

      let message = `Entities in this realm:\n\n`;
      
      for (const [type, names] of Object.entries(grouped)) {
        message += `${type}:\n`;
        message += names.map(n => `  - ${n}`).join('\n');
        message += '\n\n';
      }

      return {
        data: entities,
        realm: realm_hex_id
      };

    } catch (error) {
      console.error('Error listing entities:', error);
      return this.errorResponse('Failed to retrieve entity list');
    }
  }

  async executeQuery(intentResult, user) {
    return await this.processQuery(intentResult, user);
  }
}

export default new CotwQueryEngine();
