// COTW Query Engine - Database intelligence system
import pool from '../db/pool.js';

class CotwQueryEngine {
  async executeQuery(intent) {
    const { type, entity } = intent;
    
    try {
      switch(type) {
        case 'WHO':
          return await this.queryWho(entity);
        case 'WHAT':
          return await this.queryWhat(entity);
        case 'WHEN':
          return await this.queryWhen(entity);
        case 'WHERE':
          return await this.queryWhere(entity);
        case 'WHY':
          return await this.queryWhy(entity);
        case 'HOW':
          return await this.queryHow(entity);
        case 'SEARCH':
          return await this.querySearch(entity);
        default:
          return { error: 'Unknown query type' };
      }
    } catch (error) {
      console.error('Query error:', error);
      return { error: 'Database query failed' };
    }
  }
  
  async queryWho(entity) {
    // Search character_profiles first
    const charQuery = `
      SELECT * FROM character_profiles 
      WHERE LOWER(character_name) LIKE LOWER($1)
      OR LOWER(description) LIKE LOWER($1)
      LIMIT 5
    `;
    
    const result = await pool.query(charQuery, [`%${entity}%`]);
    
    if (result.rows.length > 0) {
      return {
        type: 'characters',
        data: result.rows,
        count: result.rows.length
      };
    }
    
    // Fallback to narrative segments
    const narrativeQuery = `
      SELECT * FROM narrative_segments
      WHERE LOWER(content) LIKE LOWER($1)
      LIMIT 5
    `;
    
    const narrativeResult = await pool.query(narrativeQuery, [`%${entity}%`]);
    
    return {
      type: 'narrative',
      data: narrativeResult.rows,
      count: narrativeResult.rows.length
    };
  }
  
  async queryWhat(entity) {
    // Search knowledge_items
    const knowledgeQuery = `
      SELECT ki.*, kd.domain_name 
      FROM knowledge_items ki
      LEFT JOIN knowledge_domains kd ON ki.domain_id = kd.domain_id
      WHERE LOWER(ki.content) LIKE LOWER($1)
      OR LOWER(ki.concept) LIKE LOWER($1)
      LIMIT 5
    `;
    
    const result = await pool.query(knowledgeQuery, [`%${entity}%`]);
    
    return {
      type: 'knowledge',
      data: result.rows,
      count: result.rows.length
    };
  }
  
  async queryWhen(entity) {
    // Search multiverse_events
    const eventQuery = `
      SELECT * FROM multiverse_events
      WHERE LOWER(notes) LIKE LOWER($1)
      ORDER BY event_timestamp DESC
      LIMIT 5
    `;
    
    const result = await pool.query(eventQuery, [`%${entity}%`]);
    
    return {
      type: 'events',
      data: result.rows,
      count: result.rows.length
    };
  }
  
  async queryWhere(entity) {
    // Search locations across multiple tables
    const locationQuery = `
      SELECT 'narrative' as source, location, content
      FROM narrative_segments
      WHERE LOWER(location) LIKE LOWER($1)
      UNION
      SELECT 'event' as source, location, notes as content
      FROM multiverse_events
      WHERE LOWER(location) LIKE LOWER($1)
      LIMIT 5
    `;
    
    const result = await pool.query(locationQuery, [`%${entity}%`]);
    
    return {
      type: 'locations',
      data: result.rows,
      count: result.rows.length
    };
  }
  
  async queryWhy(entity) {
    // Search for causal relationships
    const causalQuery = `
      SELECT * FROM character_relationships
      WHERE LOWER(relationship_type) LIKE '%cause%'
      OR LOWER(relationship_type) LIKE '%reason%'
      AND (LOWER(source_character_id) IN (
        SELECT character_id FROM character_profiles 
        WHERE LOWER(character_name) LIKE LOWER($1)
      ))
      LIMIT 5
    `;
    
    const result = await pool.query(causalQuery, [`%${entity}%`]);
    
    return {
      type: 'causality',
      data: result.rows,
      count: result.rows.length
    };
  }
  
  async queryHow(entity) {
    // Search for processes and methods
    const processQuery = `
      SELECT * FROM knowledge_items
      WHERE LOWER(content) LIKE '%how%'
      AND LOWER(content) LIKE LOWER($1)
      LIMIT 5
    `;
    
    const result = await pool.query(processQuery, [`%${entity}%`]);
    
    return {
      type: 'process',
      data: result.rows,
      count: result.rows.length
    };
  }
  
  async querySearch(entity) {
    // Comprehensive search across all major tables
    const searchQuery = `
      SELECT 'character' as source_type, character_id as id, character_name as title, description as content
      FROM character_profiles
      WHERE LOWER(character_name) LIKE LOWER($1) OR LOWER(description) LIKE LOWER($1)
      UNION ALL
      SELECT 'knowledge' as source_type, knowledge_id as id, concept as title, content
      FROM knowledge_items
      WHERE LOWER(content) LIKE LOWER($1) OR LOWER(concept) LIKE LOWER($1)
      UNION ALL
      SELECT 'narrative' as source_type, segment_id as id, title, content
      FROM narrative_segments
      WHERE LOWER(content) LIKE LOWER($1) OR LOWER(title) LIKE LOWER($1)
      UNION ALL
      SELECT 'event' as source_type, event_id as id, event_type as title, notes as content
      FROM multiverse_events
      WHERE LOWER(notes) LIKE LOWER($1)
      LIMIT 10
    `;
    
    const result = await pool.query(searchQuery, [`%${entity}%`]);
    
    return {
      type: 'search_results',
      data: result.rows,
      count: result.rows.length
    };
  }
}

export default new CotwQueryEngine();
