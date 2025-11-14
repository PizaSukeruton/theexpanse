import express from 'express';
import cotwIntentMatcher from '../backend/councilTerminal/cotwIntentMatcher.js';

const router = express.Router();

/**
 * Test Intent Matcher Endpoint
 * Used by intent-matcher-tester.html UI
 */
router.post('/api/test-intent', async (req, res) => {
  try {
    const { query, accessLevel } = req.body;

    if (!query || !accessLevel) {
      return res.status(400).json({
        success: false,
        error: 'Missing query or accessLevel'
      });
    }

    // Create mock user object
    const user = {
      access_level: parseInt(accessLevel),
      username: 'TestUser'
    };

    // Call the intent matcher
    const result = await cotwIntentMatcher.matchIntent(query, null, user);

    res.json({
      success: true,
      result: result
    });

  } catch (error) {
    console.error('Intent matcher test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
