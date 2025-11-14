const pool = require('../../db/pool');
const { generateAokHexId } = require('../../utils/hexIdGenerator');

class KnowledgeEngine {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
    this.characterId = '#700002'; // Claude The Tanuki
  }

  async storeKnowledge(questionId, question, answer, category = 'general') {
    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO knowledge_items (id, question, answer, category, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (id) DO UPDATE SET
          answer = $3,
          category = $4,
          updated_at = NOW()
        RETURNING *`;
      
      const result = await client.query(query, [questionId, question, answer, category]);
      this.cache.delete(questionId);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async retrieveKnowledge(questionId) {
    if (this.cache.has(questionId)) {
      const cached = this.cache.get(questionId);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM knowledge_items WHERE id = $1';
      const result = await client.query(query, [questionId]);
      
      if (result.rows.length > 0) {
        this.cache.set(questionId, {
          data: result.rows[0],
          timestamp: Date.now()
        });
        return result.rows[0];
      }
      return null;
    } finally {
      client.release();
    }
  }

  async findSimilarQuestions(question, threshold = 0.3) {
    const keywords = question.toLowerCase().split(' ')
      .filter(word => word.length > 3);
    
    const client = await pool.connect();
    try {
      const query = `
        SELECT *, 
          (SELECT COUNT(*) FROM unnest(string_to_array(lower(question), ' ')) AS word
           WHERE word = ANY($1)) as match_count
        FROM knowledge_items
        WHERE (SELECT COUNT(*) FROM unnest(string_to_array(lower(question), ' ')) AS word
               WHERE word = ANY($1)) > $2
        ORDER BY match_count DESC
        LIMIT 5`;
      
      const result = await client.query(query, [keywords, Math.floor(keywords.length * threshold)]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  calculateConfidence(timesCorrect, timesIncorrect, recency) {
    const accuracy = timesCorrect / (timesCorrect + timesIncorrect + 1);
    const recencyFactor = Math.exp(-recency / 86400000); // Decay over 24 hours
    return Math.min(accuracy * 0.7 + recencyFactor * 0.3, 1.0);
  }

  async generateResponse(questionId) {
    const knowledge = await this.retrieveKnowledge(questionId);
    
    if (!knowledge) {
      return {
        answer: null,
        confidence: 0,
        source: 'unknown'
      };
    }

    const client = await pool.connect();
    try {
      const stateQuery = `
        SELECT * FROM character_knowledge_state 
        WHERE character_id = $1 AND knowledge_id = $2`;
      
      const stateResult = await client.query(stateQuery, [this.characterId, questionId]);
      
      let confidence = 0.5;
      if (stateResult.rows.length > 0) {
        const state = stateResult.rows[0];
        const recency = Date.now() - new Date(state.last_reviewed).getTime();
        confidence = this.calculateConfidence(
          state.times_correct || 0,
          state.times_incorrect || 0,
          recency
        );
      }

      return {
        answer: knowledge.answer,
        confidence: confidence,
        source: 'learned'
      };
    } finally {
      client.release();
    }
  }
}

module.exports = KnowledgeEngine;
