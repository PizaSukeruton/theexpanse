import express from 'express';
const router = express.Router();

// Import TSE components
import TSELoopManager from './TSELoopManager.js';
import BeltProgressionManager from './BeltProgressionManager.js';
import PerformanceMonitor from './PerformanceMonitor.js';

// TSE Pipeline endpoints
router.get('/', (req, res) => {
  res.json({ 
    message: 'TSE Pipeline API',
    endpoints: [
      '/status',
      '/exam/:characterId',
      '/progress/:characterId',
      '/belt/:characterId',
      '/performance/:characterId'
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
        performance: 'PerformanceMonitor online'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
