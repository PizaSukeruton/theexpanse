import express from "express";
const router = express.Router();

import councilRoutes from './routes/council.js';
import eventsRoutes from './routes/events.js';
import councilChatRouter from './routes/councilChat.js';

router.use('/council', councilRoutes);
router.use('/events', eventsRoutes);
router.use('/council', councilChatRouter);

router.get('/', (req, res) => {
  res.json({ message: 'Expanse API root active', endpoints: ['/council'] });
});

export default router;
