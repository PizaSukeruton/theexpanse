import express from 'express';
import TSE from '../TSE/index.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { characterId, prompt } = req.body;
    if (!characterId || !prompt) {
      return res.status(400).json({ success: false, message: 'characterId and prompt are required' });
    }

    const answer = await TSE.NaturalLanguageGenerator.generateForCharacter(characterId, prompt);
    res.json({ success: true, characterId, prompt, answer });
  } catch (err) {
    console.error('Error in /api/ask:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
