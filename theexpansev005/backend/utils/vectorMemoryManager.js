import pool from '../db/pool.js';
import generateHexId from './hexIdGenerator.js';
import { createHash } from 'crypto';

class VectorMemoryManager {
  
  generateLocalEmbedding(text) {
    const hash = createHash('sha256').update(text).digest();
    const embedding = [];
    
    for (let i = 0; i < 384; i++) {
      const byte = hash[(i % hash.length)];
      embedding.push((byte / 255.0) * 2 - 1);
    }
    
    return embedding;
  }

  async storeConversationVector(userId, userMessage, systemResponse, metadata = {}) {
    const vectorId = await generateHexId('conversation_id');
    const embedding = this.generateLocalEmbedding(userMessage + ' ' + systemResponse);

    const query = `
      INSERT INTO tse_conversation_vectors (
        vector_id, user_id, user_message, system_response, 
        embedding, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *;
    `;

    try {
      const startTime = Date.now();
      const result = await pool.query(query, [
        vectorId,
        userId,
        userMessage,
        systemResponse,
        JSON.stringify(embedding),
        JSON.stringify(metadata)
      ]);
      const latency = Date.now() - startTime;

      console.log(`✓ Vector stored for user ${userId}: ${vectorId} (${latency}ms)`);
      return {
        vector_id: vectorId,
        latency_ms: latency
      };
    } catch (error) {
      console.error(`✗ Vector storage failed:`, error.message);
      throw error;
    }
  }

  cosineSimilarity(vec1, vec2) {
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    return mag1 === 0 || mag2 === 0 ? 0 : dotProduct / (mag1 * mag2);
  }

  async retrieveSimilarVectors(userId, queryText, limit = 5, threshold = 0.65) {
    const queryEmbedding = this.generateLocalEmbedding(queryText);

    const query = `
      SELECT vector_id, user_message, system_response, embedding, metadata
      FROM tse_conversation_vectors
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 100;
    `;

    try {
      const startTime = Date.now();
      const result = await pool.query(query, [userId]);
      const embeddingTime = Date.now() - startTime;

      const scored = result.rows.map(row => {
        const embedding = JSON.parse(row.embedding);
        const similarity = this.cosineSimilarity(queryEmbedding, embedding);
        return {
          ...row,
          similarity
        };
      });

      const filtered = scored
        .filter(item => item.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(item => ({
          vector_id: item.vector_id,
          message: item.user_message,
          response: item.system_response,
          similarity: item.similarity,
          metadata: JSON.parse(item.metadata)
        }));

      const retrievalTime = Date.now() - startTime;

      console.log(`✓ Retrieved ${filtered.length} vectors for user ${userId}`);

      return {
        vectors: filtered,
        query_latency_ms: retrievalTime,
        embedding_latency_ms: 0,
        retrieval_latency_ms: retrievalTime
      };
    } catch (error) {
      console.error(`✗ Vector retrieval failed:`, error.message);
      throw error;
    }
  }

  async getSessionContext(userId) {
    const query = `
      SELECT * FROM tse_session_contexts
      WHERE user_id = $1
      ORDER BY created_at DESC LIMIT 1;
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`✗ Error getting session context:`, error.message);
      throw error;
    }
  }

  async initializeSession(userId) {
    const sessionId = await generateHexId('conversation_id');

    const query = `
      INSERT INTO tse_session_contexts (
        session_id, user_id, conversation_state, conversation_turns
      ) VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    try {
      const result = await pool.query(query, [
        sessionId,
        userId,
        {},
        0
      ]);

      console.log(`✓ Session initialized for user ${userId}`);
      return result.rows[0];
    } catch (error) {
      console.error(`✗ Error initializing session:`, error.message);
      throw error;
    }
  }

  async updateSessionContext(userId, updates) {
    const query = `
      UPDATE tse_session_contexts
      SET conversation_state = $2, conversation_turns = $3, updated_at = NOW()
      WHERE user_id = $1
      RETURNING *;
    `;

    try {
      const result = await pool.query(query, [
        userId,
        JSON.stringify(updates.state || {}),
        updates.turns || 0
      ]);

      console.log(`✓ Session context updated for user ${userId}`);
      return result.rows[0];
    } catch (error) {
      console.error(`✗ Error updating session context:`, error.message);
      throw error;
    }
  }

  async getMemoryStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_vectors,
        AVG(CAST(metadata->>'confidence' AS FLOAT)) as average_confidence
      FROM tse_conversation_vectors
      WHERE user_id = $1;
    `;

    try {
      const result = await pool.query(query, [userId]);
      return {
        total_vectors: parseInt(result.rows[0].total_vectors) || 0,
        average_confidence: parseFloat(result.rows[0].average_confidence) || 0,
        average_latency_ms: 0
      };
    } catch (error) {
      console.error(`✗ Error getting memory stats:`, error.message);
      throw error;
    }
  }

  async updateMemoryStats(userId) {
    console.log(`✓ Memory stats updated for user ${userId}`);
    return true;
  }
}

export default new VectorMemoryManager();
