import express from 'express';
import { getUpdateInterval, setUpdateInterval, stopPsychicEngine, startPsychicEngine } from '../psychicEngineScheduler.js';
import pool from '../db/pool.js';

const router = express.Router();

router.get('/config', async (req, res) => {
  try {
    const interval = getUpdateInterval();
    res.json({
      success: true,
      config: {
        updateInterval: interval,
        status: 'running'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/config/interval', async (req, res) => {
  try {
    const { intervalMs } = req.body;
    
    if (!intervalMs || intervalMs < 1000 || intervalMs > 60000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Interval must be between 1000 and 60000 milliseconds' 
      });
    }
    
    setUpdateInterval(intervalMs);
    
    res.json({
      success: true,
      message: `Update interval set to ${intervalMs}ms`,
      config: {
        updateInterval: intervalMs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/start', async (req, res) => {
  try {
    const { intervalMs } = req.body;
    await startPsychicEngine(intervalMs);
    res.json({ success: true, message: 'Psychic engine started' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/stop', async (req, res) => {
  try {
    stopPsychicEngine();
    res.json({ success: true, message: 'Psychic engine stopped' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/status', async (req, res) => {
  try {
    const framesCount = await pool.query('SELECT COUNT(*) FROM psychic_frames');
    const moodsCount = await pool.query('SELECT COUNT(*) FROM psychic_moods');
    const proximityCount = await pool.query('SELECT COUNT(*) FROM psychic_proximity');
    
    const latestFrame = await pool.query(
      'SELECT character_id, timestamp FROM psychic_frames ORDER BY timestamp DESC LIMIT 1'
    );
    
    res.json({
      success: true,
      status: {
        updateInterval: getUpdateInterval(),
        database: {
          frames: parseInt(framesCount.rows[0].count),
          moods: parseInt(moodsCount.rows[0].count),
          proximity: parseInt(proximityCount.rows[0].count),
          latestFrame: latestFrame.rows[0] || null
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
