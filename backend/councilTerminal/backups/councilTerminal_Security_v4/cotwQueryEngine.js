import { getAllEntitiesInRealm } from '../utils/entityHelpers.js';
import pool from '../db/pool.js';

/**
 * Universal Query Engine for Council Terminal
 * * Processes intent results from cotwIntentMatcher.js and generates responses
 * Uses entities table with realm isolation
 * Handles all intent types: WHO, WHAT, WHICH, IS, CAN, WHEN, WHERE, WHY, HOW, SEARCH
 */

class CotwQueryEngine {
  constructor() {
    this.responseCache = new Map();
    this.CACHE_TTL = 300000; // 5 minutes
  }

  /**
   * Helper: Fetch the actual row from the source table
   */
  async fetchSourceRow(entityData) {
    if (!entityData || !entityData.source_table || !entityData.source_hex_id) {
      return null;
    }

    const { source_table, source_hex_id } = entityData;
    let query = '';
    let idColumn = '';

    // Map tables to their ID columns
    switch (source_table) {
      case 'character_profiles':
        idColumn = 'character_id';
        break;
      case 'locations':
        idColumn = 'location_id';
        break;
      case 'knowledge_items':
        idColumn = 'knowledge_id'; // Assuming standard naming, fallback check below
        break;
      case 'multiverse_events':
        idColumn = 'event_id';
        break;
      case 'objects':
        idColumn = 'object_id';
        break;
      default:
        // Generic fallback if we can't determine ID column safely
        return null;
    }

    // Special handling if knowledge_items uses 'item_id' or similar
    // For now assuming the source_hex_id matches the primary key used in the table
    try {
      const sql = `SELECT * FROM ${source_table} WHERE ${idColumn} = $1`;
      const result = await pool.query(sql, [source_hex_id]);
      return result.rows[0] || null;
    } catch (err) {
      console.error(`[QueryEngine] Failed to fetch source row from ${source_table}:`, err.message);
      return null;
    }
  }

  /**
   * Main query processing function
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
        case 'not_found': return this.notFoundResponse(entity, realm);
        case 'confirm': return this.confirmResponse(searchResult);
        case 'clarify': return this.clarifyResponse(searchResult);
        case 'disambiguate': return this.disambiguateResponse(searchResult);
        case 'refine': return this.refineResponse(searchResult);
      }
    }

    // Handle successful single match
    if (entityData) {
      // Fetch the full details from the database before handling
      const fullDetails = await this.fetchSourceRow(entityData);
      // Merge basic entity data with full details (full details take precedence)
      const enrichedData = { ...entityData, ...fullDetails };
      
      return await this.handleIntentType(type, enrichedData, realm);
    }

    // Fallback
    return this.errorResponse('Unable to process query');
  }

  /**
   * Route to appropriate handler based on intent type
   */
  async handleIntentType(type, entityData, realm) {
    switch (type) {
      case 'WHO': return this.handleWho(entityData, realm);
      case 'WHAT': return this.handleWhat(entityData, realm);
      case 'WHICH': return this.handleWhich(entityData, realm);
      case 'IS': return this.handleIs(entityData, realm);
      case 'CAN': return this.handleCan(entityData, realm);
      case 'WHEN': return this.handleWhen(entityData, realm);
      case 'WHERE': return this.handleWhere(entityData, realm);
      case 'WHY': return this.handleWhy(entityData, realm);
      case 'HOW': return this.handleHow(entityData, realm);
      case 'SEARCH': return this.handleSearch(entityData, realm);
      case 'SHOW_IMAGE': return this.handleShowImage(entityData, realm);
      default: return this.errorResponse(`Unknown intent type: ${type}`);
    }
  }

  /**
   * WHO handler - Returns information about a person/character
   */
  async handleWho(entityData, realm) {
    const { entity_name, entity_type, category, search_context, biography, description, traits } = entityData;
    
    if (entity_type === 'KNOWLEDGE') {
      // ** INTELLIGENT REDIRECT **
      // If the user asks "who is X" and X is a concept, redirect to the WHAT handler for a detailed response.
      return this.handleWhat(entityData, realm);
    }

    let message = `**${entity_name}**`;
    
    if (category) message += ` (${category})`;
    message += '\n';

    if (description) {
      message += `${description}\n`;
    } else if (biography) {
      message += `${biography.substring(0, 300)}${biography.length > 300 ? '...' : ''}\n`;
    } else if (search_context) {
      message += `${search_context}\n`;
    }

    if (traits) {
      // Handle traits if they are an array or string
      const traitsStr = Array.isArray(traits) ? traits.join(', ') : traits;
      message += `\n**Traits:** ${traitsStr}`;
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
    const { entity_name, entity_type, search_context, content, description, definition } = entityData;
    
    let message = `**${entity_name}**`;
    
    // Check if the content is a structured JSON fact
    if (content) {
      try {
        const parsedContent = JSON.parse(content);
        if (parsedContent.statement) {
            message += `\nFact: ${parsedContent.statement}`;
        } else {
            message += `\n${content}`; // Fallback if JSON is present but lacks statement field
        }
      } catch (e) {
        // Content is not JSON, treat it as plain text definition
        message += `\n${content}`;
      }
    } else if (definition) {
      message += `\n${definition}`;
    } else if (description) {
      message += `\n${description}`;
    } else if (search_context) {
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
    const { entity_name, category, search_context, description } = entityData;
    
    let message = `${entity_name}`;
    
    if (category) {
      message += ` is the ${category}`;
    }
    
    if (description || search_context) {
      message += ` known for: ${description || search_context}`;
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
    const { entity_name, category, entity_type } = entityData;
    
    let message = `Yes, **${entity_name}** exists in this realm.`;
    
    if (category) {
      message += ` It is classified as: ${category}`;
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
    const { entity_name, abilities, skills, description } = entityData;
    
    let message = `Regarding abilities of **${entity_name}**:`;
    
    if (abilities || skills) {
        const caps = abilities || skills;
        message += `\n${Array.isArray(caps) ? caps.join(', ') : caps}`;
    } else if (description) {
        message += `\n${description}`;
    } else {
        message += `\nSpecific capabilities are not documented, but they are a ${entityData.category || entityData.entity_type}.`;
    }

    return {
      success: true,
      message,
      data: entityData,
      realm
    };
  }

  /**
   * WHEN handler - Temporal questions
   */
  async handleWhen(entityData, realm) {
    const { entity_name, timestamp, created_at, event_date } = entityData;
    
    let message = `Regarding **${entity_name}**:`;
    
    const time = timestamp || event_date || created_at;
    
    if (time) {
        const dateObj = new Date(time);
        message += `\nThis is associated with the date: ${dateObj.toLocaleString()}`;
    } else {
        message += `\nNo specific timestamp information is available.`;
    }

    return {
      success: true,
      message,
      data: entityData,
      realm
    };
  }

  /**
   * WHERE handler - Location questions
   */
  async handleWhere(entityData, realm) {
    const { entity_name, entity_type, location, current_location, coordinates, realm: entityRealm } = entityData;
    
    let message = `**${entity_name}**`;
    
    // 1. If it's a Character
    if (entity_type === 'PERSON' || entity_type === 'CHARACTER') {
        if (current_location || location) {
            message += ` is currently located at: ${current_location || location}`;
        } else {
            message += ` location is currently unknown.`;
        }
    } 
    // 2. If it's a Location
    else if (entity_type === 'LOCATION' || entity_type === 'PLACE') {
        message += ` is located in realm ${entityRealm || realm}.`;
        if (coordinates) {
            message += ` (Coordinates: ${coordinates})`;
        }
        if (entityData.description) {
            message += `\n${entityData.description}`;
        }
    }
    // 3. Generic Fallback
    else {
        if (location) {
             message += ` is found at: ${location}`;
        } else {
             message += ` is located within realm ${entityRealm || realm}.`;
        }
    }

    return {
      success: true,
      message,
      data: entityData,
      realm
    };
  }

  /**
   * WHY handler - Reason/explanation questions
   */
  async handleWhy(entityData, realm) {
    const { entity_name, search_context, description, outcome, notes } = entityData;
    
    let message = `Regarding **${entity_name}**:`;
    
    if (notes) {
        message += `\n${notes}`;
    } else if (outcome) {
        message += `\nOutcome: ${outcome}`;
    } else if (description) {
        message += `\n${description}`;
    } else {
        message += `\n${search_context || "Detailed context is not available."}`;
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
     const { entity_name, description, mechanics, instructions } = entityData;
     
     let message = `**${entity_name}**`;
     
     if (mechanics) {
         message += ` works via:\n${mechanics}`;
     } else if (instructions) {
         message += `:\n${instructions}`;
     } else if (description) {
         message += `\n${description}`;
     } else {
         message += `\nOperational details are not specified.`;
     }
     
    return {
      success: true,
      message,
      data: entityData,
      realm
    };
  }

  /**
   * SEARCH handler - General search
   */
  async handleSearch(entityData, realm) {
    const { entity_name, description, search_context } = entityData;
    
    let message = `**${entity_name}**`;
    if (description || search_context) {
        message += `\n${description || search_context}`;
    }
    
    return {
      success: true,
      message,
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
      message: `Displaying visual for **${entityData.entity_name}**`,
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
        success: true,
        message,
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
