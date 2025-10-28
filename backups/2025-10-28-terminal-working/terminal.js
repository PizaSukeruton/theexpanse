import express from 'express';
import TerminalCore from '../terminalCore.cjs';

const router = express.Router();
const terminal = new TerminalCore();

router.post('/query', async (req, res) => {
  const { question } = req.body;
  const userId = req.session?.userId || null;
  
  if (!question) {
    return res.status(400).json({ 
      error: 'NO_QUERY_PROVIDED',
      data: null 
    });
  }
  
  const response = await terminal.processQuery(question, userId);
  res.json(response);
});

export default router;
