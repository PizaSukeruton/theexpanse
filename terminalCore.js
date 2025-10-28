const pool = require('./db/connection');

class TerminalCore {
  constructor() {
    this.accessLevels = {
      PUBLIC: 0,
      USER: 1,
      SPECIFIC: 2,
      COUNCIL: 3,
      ADMIN: 4
    };
  }

  async processQuery(question, userId = null) {
    try {
      const accessLevel = await this.getUserAccess(userId);
      const knowledge = await this.searchKnowledge(question);
      return this.formatResponse(knowledge, accessLevel);
    } catch (error) {
      console.error('Query processing error:', error);
      return { error: 'SYSTEM_ERROR', data: null };
    }
  }

  async getUserAccess(userId) {
    if (!userId) return this.accessLevels.PUBLIC;
    
    const query = 'SELECT access_level FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);
    
    return result.rows.length > 0 
      ? result.rows[0].access_level 
      : this.accessLevels.PUBLIC;
  }

  async searchKnowledge(searchQuery) {
    const [aokResults] = await Promise.all([
      this.searchAOK(searchQuery)
    ]);
    
    return {
      aok: aokResults
    };
  }

  async searchAOK(searchQuery) {
    const query = `
      SELECT 
        id,
        title as question,
        content as answer,
        access_level
      FROM aok_entries
      WHERE 
        LOWER(title) LIKE LOWER($1) OR 
        LOWER(content) LIKE LOWER($1)
      LIMIT 10
    `;
    
    const searchPattern = `%${searchQuery}%`;
    const result = await pool.query(query, [searchPattern]);
    return result.rows;
  }

  formatResponse(knowledge, accessLevel) {
    const filteredAok = knowledge.aok.filter(item => 
      !item.access_level || item.access_level <= accessLevel
    );
    
    if (accessLevel === this.accessLevels.PUBLIC && filteredAok.length > 0) {
      return {
        data: filteredAok,
        message: 'REGISTER FOR EXPANDED ACCESS',
        access_level: accessLevel
      };
    }
    
    return {
      data: filteredAok,
      access_level: accessLevel
    };
  }
}

module.exports = TerminalCore;
