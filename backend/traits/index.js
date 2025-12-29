import express from 'express';
const router = express.Router();

// Import Traits components
import TraitManager from './TraitManager.js';
import { getToneFromTraits, determinePersonality } from './PersonalityEngine.js';
import { applyLinguisticStyling } from './LinguisticStyler.js';

// Traits API endpoints
router.get('/', (req, res) => {
  res.json({ 
    message: 'Traits System API',
    endpoints: [
      '/status',
      '/character/:characterId',
      '/personality/:characterId'
    ]
  });
});

router.get('/status', async (req, res) => {
  try {
    res.json({ 
      status: 'Traits System operational',
      components: {
        traitManager: 'Active',
        personalityEngine: 'Ready (getToneFromTraits, determinePersonality)',
        linguisticStyler: 'Online (applyLinguisticStyling)'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/character/:characterId', async (req, res) => {
  try {
    // TraitManager is already instantiated as singleton
    const traits = await TraitManager.getCharacterTraits?.(req.params.characterId) || 
                   { error: 'Method not available' };
    res.json(traits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/personality/:characterId', async (req, res) => {
  try {
    const tone = await getToneFromTraits(req.params.characterId);
    res.json({ characterId: req.params.characterId, tone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
