import express from 'express';
import cotwIntentMatcher from '../backend/councilTerminal/cotwIntentMatcher.js';

const router = express.Router();

/**
 * Simple GET endpoint for browser testing
 * Usage: http://localhost:3000/api/test-intent-simple?query=Who is Batman?&level=1
 */
router.get('/api/test-intent-simple', async (req, res) => {
  try {
    const query = req.query.query;
    const level = parseInt(req.query.level) || 1;

    if (!query) {
      return res.json({
        error: 'Missing query parameter',
        usage: '/api/test-intent-simple?query=Who is Batman?&level=1'
      });
    }

    const user = {
      access_level: level,
      username: 'CoMetTester'
    };

    const result = await cotwIntentMatcher.matchIntent(query, null, user);

    res.json({
      success: true,
      query: query,
      result: {
        type: result.type,
        entity: result.entity,
        confidence: result.confidence,
        realm: result.realm,
        method: result.searchResult?.method
      }
    });

  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

export default router;
