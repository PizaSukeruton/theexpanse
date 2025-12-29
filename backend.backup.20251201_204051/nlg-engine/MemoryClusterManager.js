import pool from '../db/pool.js';

class MemoryClusterManager {
  constructor() {
    this.clusterCache = new Map();
    this.reflectionThreshold = 5;
  }

  async upsertCluster(clusterData) {
    const { cluster_id, entities, intent_type, timeline_events, pad_summary, importance, character_id } = clusterData;
    try {
      const query = `INSERT INTO memory_clusters (cluster_id, character_id, entities, intent_type, timeline_events, pad_summary, importance, last_accessed) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) ON CONFLICT (cluster_id) DO UPDATE SET last_accessed = NOW(), access_count = memory_clusters.access_count + 1, pad_summary = $6 RETURNING *;`;
      const result = await pool.query(query, [cluster_id, character_id, JSON.stringify(entities), intent_type, JSON.stringify(timeline_events), JSON.stringify(pad_summary), importance]);
      return result.rows[0];
    } catch (error) {
      console.error('[MemoryClusterManager] Error upserting cluster:', error);
      throw error;
    }
  }

  scoreCluster(cluster, query, alpha = 0.3, beta = 0.4, gamma = 0.3) {
    const now = Date.now();
    const lastAccessMs = new Date(cluster.last_accessed).getTime();
    const ageHours = (now - lastAccessMs) / (1000 * 60 * 60);
    const recencyScore = Math.exp(-ageHours / 24);
    const importanceScore = Math.min(1, cluster.importance / 10);
    const queryTokens = query.toLowerCase().split(/\s+/);
    const clusterEntities = (cluster.entities || []).map(e => e.toLowerCase ? e.toLowerCase() : e);
    const matchCount = queryTokens.filter(t => clusterEntities.some(e => e.includes(t) || t.includes(e)));
    const relevanceScore = matchCount.length / Math.max(1, queryTokens.length);
    const totalScore = (alpha * recencyScore) + (beta * importanceScore) + (gamma * relevanceScore);
    return { cluster_id: cluster.cluster_id, score: Math.min(1, totalScore), components: { recency: recencyScore, importance: importanceScore, relevance: relevanceScore } };
  }

  async findClusters(characterId, query, limit = 5) {
    try {
      const clusterQuery = `SELECT * FROM memory_clusters WHERE character_id = $1 ORDER BY last_accessed DESC LIMIT $2`;
      const result = await pool.query(clusterQuery, [characterId, limit * 2]);
      const scored = result.rows.map(cluster => this.scoreCluster(cluster, query));
      return scored.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
      console.error('[MemoryClusterManager] Error finding clusters:', error);
      return [];
    }
  }

  async addMemoryEvent(clusterId, eventData) {
    const { content, entity_type, importance, emotion_tag } = eventData;
    try {
      const query = `INSERT INTO memory_events (event_id, cluster_id, content, entity_type, importance, emotion_tag, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW()) RETURNING *;`;
      const result = await pool.query(query, [clusterId, content, entity_type, importance, emotion_tag]);
      return result.rows[0];
    } catch (error) {
      console.error('[MemoryClusterManager] Error adding memory event:', error);
      throw error;
    }
  }

  async synthesizeReflections(clusterId) {
    try {
      const query = `SELECT content, emotion_tag FROM memory_events WHERE cluster_id = $1 ORDER BY created_at DESC LIMIT $2`;
      const result = await pool.query(query, [clusterId, this.reflectionThreshold]);
      if (result.rows.length < this.reflectionThreshold) {
        return null;
      }
      const emotions = result.rows.map(r => r.emotion_tag).filter(Boolean);
      const dominantEmotion = emotions.length > 0 ? emotions[0] : 'neutral';
      const reflection = { cluster_id: clusterId, type: 'synthesis', insight: `Cluster exhibits pattern of ${dominantEmotion} emotional tone`, confidence: 0.7, created_at: new Date().toISOString() };
      return reflection;
    } catch (error) {
      console.error('[MemoryClusterManager] Error synthesizing reflections:', error);
      return null;
    }
  }

  async applyMemoryDecay(characterId, decayFactor = 0.95) {
    try {
      const query = `UPDATE memory_clusters SET importance = importance * $1 WHERE character_id = $2 AND last_accessed < NOW() - INTERVAL '7 days' RETURNING *;`;
      const result = await pool.query(query, [decayFactor, characterId]);
      return result.rowCount;
    } catch (error) {
      console.error('[MemoryClusterManager] Error applying decay:', error);
      return 0;
    }
  }
}

export default new MemoryClusterManager();
