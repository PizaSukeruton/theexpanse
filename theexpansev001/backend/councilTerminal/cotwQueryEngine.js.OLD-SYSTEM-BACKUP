import pool from '../db/pool.js';

class CotwQueryEngine {
  constructor() {
    this.recentQueries = new Map();
    this.maxRecentQueries = 100;
  }

  // Calculate Levenshtein distance for "Did you mean?" suggestions
  levenshteinDistance(str1, str2) {
    const matrix = [];
    const n = str1.length;
    const m = str2.length;
    
    if (n === 0) return m;
    if (m === 0) return n;
    
    for (let i = 0; i <= m; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= n; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    
    return matrix[m][n];
  }

  async findSimilarEntities(entity, limit = 3) {
    const query = `
      SELECT character_name as name, 'character' as type FROM character_profiles
      UNION ALL
      SELECT DISTINCT concept as name, 'knowledge' as type FROM knowledge_items WHERE concept IS NOT NULL
      UNION ALL
      SELECT DISTINCT title as name, 'narrative' as type FROM narrative_segments WHERE title IS NOT NULL
    `;
    
    const result = await pool.query(query);
    
    const scored = result.rows
      .map(row => ({
        ...row,
        distance: this.levenshteinDistance(entity.toLowerCase(), row.name.toLowerCase())
      }))
      .filter(row => row.distance < entity.length * 0.7)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
    
    return scored.map(s => s.name);
  }

  rankResults(results, searchTerm) {
    return results.map(result => {
      let score = 0;
      const term = searchTerm.toLowerCase();
      
      // Exact match in title/name
      if (result.character_name && result.character_name.toLowerCase() === term) score += 100;
      if (result.title && result.title.toLowerCase() === term) score += 100;
      if (result.concept && result.concept.toLowerCase() === term) score += 100;
      
      // Partial match in title/name
      if (result.character_name && result.character_name.toLowerCase().includes(term)) score += 50;
      if (result.title && result.title.toLowerCase().includes(term)) score += 50;
      if (result.concept && result.concept.toLowerCase().includes(term)) score += 50;
      
      // Match in content/description
      if (result.content && result.content.toLowerCase().includes(term)) score += 20;
      if (result.description && result.description.toLowerCase().includes(term)) score += 30;
      
      // Word boundary matches
      const wordBoundary = new RegExp(`\\b${term}\\b`, 'i');
      if (result.character_name && wordBoundary.test(result.character_name)) score += 25;
      if (result.title && wordBoundary.test(result.title)) score += 25;
      
      return { ...result, relevanceScore: score };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  async getRelatedEntities(entity, entityType) {
    const queries = {
      character: `
        SELECT DISTINCT c2.character_name as name, c2.character_id as id
        FROM character_profiles c1
        JOIN characters_in_narrative cin1 ON c1.character_id = cin1.character_id
        JOIN characters_in_narrative cin2 ON cin1.current_narrative_segment_id = cin2.current_narrative_segment_id
        JOIN character_profiles c2 ON cin2.character_id = c2.character_id
        WHERE LOWER(c1.character_name) LIKE LOWER($1) AND c1.character_id != c2.character_id
        LIMIT 3
      `,
      knowledge: `
        SELECT k2.concept as name, k2.knowledge_id as id
        FROM knowledge_items k1
        JOIN knowledge_relationships kr ON k1.knowledge_id = kr.source_knowledge_id
        JOIN knowledge_items k2 ON kr.target_knowledge_id = k2.knowledge_id
        WHERE LOWER(k1.concept) LIKE LOWER($1)
        LIMIT 3
      `,
      event: `
        SELECT DISTINCT event_type as name, event_id as id
        FROM multiverse_events
        WHERE narrative_arc_id IN (
          SELECT narrative_arc_id FROM multiverse_events
          WHERE LOWER(event_type) LIKE LOWER($1)
        )
        LIMIT 3
      `
    };
    
    const queryToUse = queries[entityType] || queries.character;
    
    try {
      const result = await pool.query(queryToUse, [`%${entity}%`]);
      return result.rows;
    } catch (error) {
      console.error('Related entities query error:', error);
      return [];
    }
  }

  async executeQuery(intent) {
    const { type, entity, suggestions } = intent;
    
    // Store query for context
    if (this.recentQueries.size >= this.maxRecentQueries) {
      const firstKey = this.recentQueries.keys().next().value;
      this.recentQueries.delete(firstKey);
    }
    this.recentQueries.set(Date.now(), { type, entity });
    
    try {
      let result;
      switch(type) {
        case 'WHO':
          result = await this.queryWho(entity);
          break;
        case 'WHAT':
          result = await this.queryWhat(entity);
          break;
        case 'WHEN':
          result = await this.queryWhen(entity);
          break;
        case 'WHERE':
          result = await this.queryWhere(entity);
          break;
        case 'WHY':
          result = await this.queryWhy(entity);
          break;
        case 'HOW':
          result = await this.queryHow(entity);
          break;
        case 'SHOW_IMAGE':
          result = await this.queryShowImage(entity);
          break;
        case 'SEARCH':
          result = await this.querySearch(entity);
          break;
        default:
          result = { error: 'Unknown query type' };
      }
      
      // Add suggestions if no results found
      if (result.count === 0 && !result.error) {
        const similarEntities = await this.findSimilarEntities(entity);
        if (similarEntities.length > 0) {
          result.suggestions = similarEntities;
          result.suggestedQuery = `Did you mean: ${similarEntities[0]}?`;
        }
        
        // Add helpful message
        result.helpfulMessage = `No results found for "${entity}". Try:\n` +
          `- Checking spelling\n` +
          `- Using different keywords\n` +
          `- Searching for related terms`;
      }
      
      // Add related entities for successful queries
      if (result.count > 0 && result.data[0]) {
        const entityType = result.type === 'characters' ? 'character' : 
                          result.type === 'knowledge' ? 'knowledge' : 
                          'event';
        const related = await this.getRelatedEntities(entity, entityType);
        if (related.length > 0) {
          result.relatedEntities = related;
        }
      }
      
      return result;
      
    } catch (error) {
      console.error('Query error:', error);
      return { error: 'Database query failed', details: error.message };
    }
  }
  
  async queryWho(entity) {
    const charQuery = `
      SELECT * FROM character_profiles 
      WHERE LOWER(character_name) LIKE LOWER($1)
      OR LOWER(description) LIKE LOWER($2)
      OR LOWER(character_name) = LOWER($3)
      ORDER BY 
        CASE WHEN LOWER(character_name) = LOWER($3) THEN 0
             WHEN LOWER(character_name) LIKE LOWER($4) THEN 1
             ELSE 2 END
      LIMIT 5
    `;
    
    const result = await pool.query(charQuery, [
      `%${entity}%`, 
      `%${entity}%`, 
      entity,
      `${entity}%`
    ]);
    
    if (result.rows.length > 0) {
      const ranked = this.rankResults(result.rows, entity);
      return {
        type: 'characters',
        data: ranked,
        count: ranked.length
      };
    }
    
    const narrativeQuery = `
      SELECT * FROM narrative_segments
      WHERE LOWER(content) LIKE LOWER($1)
      OR LOWER(title) LIKE LOWER($1)
      LIMIT 5
    `;
    
    const narrativeResult = await pool.query(narrativeQuery, [`%${entity}%`]);
    const rankedNarrative = this.rankResults(narrativeResult.rows, entity);
    
    return {
      type: 'narrative',
      data: rankedNarrative,
      count: rankedNarrative.length
    };
  }
  
  async queryWhat(entity) {
    const knowledgeQuery = `
      SELECT ki.*, kd.domain_name 
      FROM knowledge_items ki
      LEFT JOIN knowledge_domains kd ON ki.domain_id = kd.domain_id
      WHERE LOWER(ki.content) LIKE LOWER($1)
      OR LOWER(ki.concept) LIKE LOWER($1)
      OR LOWER(ki.concept) = LOWER($2)
      ORDER BY 
        CASE WHEN LOWER(ki.concept) = LOWER($2) THEN 0
             WHEN LOWER(ki.concept) LIKE LOWER($3) THEN 1
             ELSE 2 END
      LIMIT 5
    `;
    
    const result = await pool.query(knowledgeQuery, [
      `%${entity}%`,
      entity,
      `${entity}%`
    ]);
    
    const ranked = this.rankResults(result.rows, entity);
    return {
      type: 'knowledge',
      data: ranked,
      count: ranked.length
    };
  }
  
  async queryWhen(entity) {
    const eventQuery = `
      SELECT * FROM multiverse_events
      WHERE LOWER(notes) LIKE LOWER($1)
      OR LOWER(event_type) LIKE LOWER($1)
      ORDER BY timestamp DESC
      LIMIT 5
    `;
    
    const result = await pool.query(eventQuery, [`%${entity}%`]);
    const ranked = this.rankResults(result.rows, entity);
    
    return {
      type: 'events',
      data: ranked,
      count: ranked.length
    };
  }
  
  async queryWhere(entity) {
    const locationQuery = `
      SELECT segment_id, title, content, associated_location_id
      FROM narrative_segments
      WHERE LOWER(content) LIKE LOWER($1)
      OR LOWER(title) LIKE LOWER($1)
      OR associated_location_id IN (
        SELECT location_id FROM locations 
        WHERE LOWER(name) LIKE LOWER($1)
      )
      LIMIT 5
    `;
    
    try {
      const result = await pool.query(locationQuery, [`%${entity}%`]);
      const ranked = this.rankResults(result.rows, entity);
      return {
        type: 'locations',
        data: ranked,
        count: ranked.length
      };
    } catch (error) {
      console.error('Location query error:', error);
      return {
        type: 'locations',
        data: [],
        count: 0
      };
    }
  }
  
  async queryWhy(entity) {
    const knowledgeQuery = `
      SELECT * FROM knowledge_items
      WHERE (LOWER(content) LIKE '%because%' OR LOWER(content) LIKE '%reason%')
      AND LOWER(content) LIKE LOWER($1)
      LIMIT 5
    `;
    
    const result = await pool.query(knowledgeQuery, [`%${entity}%`]);
    const ranked = this.rankResults(result.rows, entity);
    
    return {
      type: 'causality',
      data: ranked,
      count: ranked.length
    };
  }
  
  async queryHow(entity) {
    const processQuery = `
      SELECT * FROM knowledge_items
      WHERE (LOWER(content) LIKE '%process%' OR LOWER(content) LIKE '%method%' OR LOWER(content) LIKE '%how%')
      AND LOWER(content) LIKE LOWER($1)
      LIMIT 5
    `;
    
    const result = await pool.query(processQuery, [`%${entity}%`]);
    const ranked = this.rankResults(result.rows, entity);
    
    return {
      type: 'process',
      data: ranked,
      count: ranked.length
    };
  }
  
  async queryShowImage(entity) {
    const charQuery = `
      SELECT * FROM character_profiles 
      WHERE LOWER(character_name) LIKE LOWER($1)
      OR LOWER(character_name) = LOWER($2)
      ORDER BY 
        CASE WHEN LOWER(character_name) = LOWER($2) THEN 0
             ELSE 1 END
      LIMIT 1
    `;
    
    const result = await pool.query(charQuery, [`%${entity}%`, entity]);
    
    if (result.rows.length > 0 && result.rows[0].image_url) {
      return {
        type: 'image',
        data: result.rows,
        count: 1,
        image: result.rows[0].image_url
      };
    }
    
    return {
      type: 'image',
      data: [],
      count: 0
    };
  }
  
  async querySearch(entity) {
    const searchQuery = `
      SELECT 'character' as source_type, character_id as id, character_name as title, description as content, NULL as relevanceScore
      FROM character_profiles
      WHERE LOWER(character_name) LIKE LOWER($1) OR LOWER(description) LIKE LOWER($1)
      UNION ALL
      SELECT 'knowledge' as source_type, knowledge_id as id, concept as title, content, NULL as relevanceScore
      FROM knowledge_items
      WHERE LOWER(content) LIKE LOWER($1) OR LOWER(concept) LIKE LOWER($1)
      UNION ALL
      SELECT 'narrative' as source_type, segment_id as id, title, content, NULL as relevanceScore
      FROM narrative_segments
      WHERE LOWER(content) LIKE LOWER($1) OR LOWER(title) LIKE LOWER($1)
      UNION ALL
      SELECT 'event' as source_type, event_id as id, event_type as title, notes as content, NULL as relevanceScore
      FROM multiverse_events
      WHERE LOWER(notes) LIKE LOWER($1) OR LOWER(event_type) LIKE LOWER($1)
      LIMIT 20
    `;
    
    const result = await pool.query(searchQuery, [`%${entity}%`]);
    const ranked = this.rankResults(result.rows, entity);
    
    return {
      type: 'search_results',
      data: ranked.slice(0, 10),
      count: Math.min(ranked.length, 10)
    };
  }
}

export default new CotwQueryEngine();
