import express from 'express';
const router = express.Router();

import pool from '../db/pool.js';
import TSELoopManager from './TSELoopManager.js';
import BeltProgressionManager from './BeltProgressionManager.js';
import PerformanceMonitor from './PerformanceMonitor.js';
import KnowledgeResponseEngine from './helpers/KnowledgeResponseEngine.js';

const knowledgeEngine = new KnowledgeResponseEngine();
await knowledgeEngine.initialize();

const tseManager = new TSELoopManager(pool);
await tseManager.initialize();

router.get('/', (req, res) => {
  res.json({ 
    message: 'TSE Pipeline API',
    endpoints: [
      '/status',
      '/exam/:characterId',
      '/progress/:characterId',
      '/belt/:characterId',
      '/performance/:characterId',
      '/knowledge/response',
      '/knowledge/profile/:characterId',
      '/knowledge/state/:characterId [NEW]',
      '/knowledge/items [NEW]',
      '/cycle/knowledge'
    ]
  });
});

router.get('/status', async (req, res) => {
  try {
    res.json({ 
      status: 'TSE Pipeline operational',
      components: {
        loopManager: 'TSELoopManager active',
        beltProgression: 'BeltProgressionManager ready',
        performance: 'PerformanceMonitor online',
        knowledgeEngine: 'KnowledgeResponseEngine ready with semantic search'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cycle/knowledge', async (req, res) => {
  try {
    const { characterId, query, domain } = req.body;
    
    if (!characterId || !query) {
      return res.status(400).json({ 
        error: 'Missing required fields: characterId and query' 
      });
    }
    
    console.log(`[TSE API] Starting knowledge cycle for ${characterId}: "${query}"`);
    
    const result = await tseManager.startKnowledgeCycle({
      characterId,
      query,
      domain: domain || 'general'
    });
    
    res.json({
      success: true,
      cycleId: result.cycle.cycle_id,
      score: result.overallScore,
      deliveryStyle: result.deliveryStyle,
      response: result.response,
      learningProfile: result.learningProfile,
      evaluation: result.evaluation
    });
    
  } catch (error) {
    console.error('[TSE API] Knowledge cycle error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post('/knowledge/response', async (req, res) => {
  try {
    const { characterId, query, context } = req.body;
    
    if (!characterId || !query) {
      return res.status(400).json({ 
        error: 'Missing required fields: characterId and query' 
      });
    }
    
    console.log(`[TSE API] Knowledge request for ${characterId}: "${query}"`);
    
    const response = await knowledgeEngine.generateKnowledgeResponse(
      characterId,
      query,
      context || {}
    );
    
    res.json({
      success: true,
      response: response
    });
    
  } catch (error) {
    console.error('[TSE API] Knowledge response error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get('/knowledge/profile/:characterId', async (req, res) => {
  try {
    const { characterId } = req.params;
    
    console.log(`[TSE API] Profile request for ${characterId}`);
    
    const CharacterEngine = (await import('../engines/CharacterEngine_TEST.js')).default;
    const characterEngine = new CharacterEngine(characterId);
    await characterEngine.loadCharacter();
    
    const learningProfile = await knowledgeEngine.analyzeTraitProfile(
      characterEngine.traits,
      characterEngine.metadata
    );
    
    await characterEngine.cleanup();
    
    res.json({
      success: true,
      characterId: characterId,
      profile: learningProfile
    });
    
  } catch (error) {
    console.error('[TSE API] Profile error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// NEW: Get character's knowledge state (what they know)
router.get('/knowledge/state/:characterId', async (req, res) => {
  try {
    const { characterId } = req.params;
    
    console.log(`[TSE API] Knowledge state request for ${characterId}`);
    
    const query = `
      SELECT 
        cks.state_id,
        cks.knowledge_item_id,
        cks.retrievability_score,
        cks.review_count,
        cks.last_reviewed_at,
        cks.next_review_at,
        cks.learning_context,
        ki.title,
        ki.domain,
        ki.tags
      FROM character_knowledge_state cks
      JOIN knowledge_items ki ON cks.knowledge_item_id = ki.item_id
      WHERE cks.character_id = $1
      ORDER BY cks.retrievability_score DESC, cks.last_reviewed_at DESC;
    `;
    
    const result = await pool.query(query, [characterId]);
    
    // Calculate statistics
    const stats = {
      totalItems: result.rows.length,
      averageRetrievability: result.rows.length > 0 
        ? result.rows.reduce((sum, item) => sum + parseFloat(item.retrievability_score), 0) / result.rows.length 
        : 0,
      itemsDueForReview: result.rows.filter(item => new Date(item.next_review_at) <= new Date()).length,
      domainBreakdown: {}
    };
    
    // Count items per domain
    result.rows.forEach(item => {
      const domain = item.domain || 'general';
      stats.domainBreakdown[domain] = (stats.domainBreakdown[domain] || 0) + 1;
    });
    
    res.json({
      success: true,
      characterId: characterId,
      knowledgeItems: result.rows,
      statistics: stats
    });
    
  } catch (error) {
    console.error('[TSE API] Knowledge state error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// NEW: Search available knowledge items (admin/debugging)
router.get('/knowledge/items', async (req, res) => {
  try {
    const { query, domain, limit } = req.query;
    
    console.log(`[TSE API] Knowledge items query: "${query || 'all'}" (domain: ${domain || 'all'})`);
    
    let sqlQuery = `
      SELECT 
        item_id,
        title,
        domain,
        tags,
        source_attribution,
        created_at
      FROM knowledge_items
      WHERE is_active = true
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (query) {
      sqlQuery += ` AND (
        title ILIKE $${paramIndex} 
        OR content ILIKE $${paramIndex}
        OR domain ILIKE $${paramIndex}
        OR tags::text ILIKE $${paramIndex}
      )`;
      params.push(`%${query}%`);
      paramIndex++;
    }
    
    if (domain) {
      sqlQuery += ` AND domain = $${paramIndex}`;
      params.push(domain);
      paramIndex++;
    }
    
    sqlQuery += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit) || 20);
    
    const result = await pool.query(sqlQuery, params);
    
    res.json({
      success: true,
      totalFound: result.rows.length,
      items: result.rows
    });
    
  } catch (error) {
    console.error('[TSE API] Knowledge items error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
