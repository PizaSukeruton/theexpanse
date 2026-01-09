import express from 'express';
import TeacherComponent from '../TSE/TeacherComponent.js';
import LoreAnswerEvaluator from "../TSE/LoreAnswerEvaluator.js";
import pool from '../db/pool.js';

const router = express.Router();

const learningDB = { pool };
const teacher = new TeacherComponent(learningDB);

router.post('/lore-task', async (req, res) => {
  try {
    const { characterId, query } = req.body;
    
    if (!characterId) {
      return res.status(400).json({ error: 'characterId required' });
    }

    const task = await teacher.teachLore(characterId, query || "Teach me about the multiverse");
    
    if (!task) {
      return res.status(404).json({ error: 'No lore tasks available' });
    }

    res.json({
      success: true,
      task
    });
  } catch (e) {
    console.error('[lore-teaching] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.get('/lore-entities', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 100);
    const result = await pool.query(`
      SELECT knowledge_id, entity_name, knowledge_type, description
      FROM lore_knowledge_graph
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      entities: result.rows,
      count: result.rows.length
    });
  } catch (e) {
    console.error('[lore-entities] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.get('/lore-entity/:knowledgeId', async (req, res) => {
  try {
    const { knowledgeId } = req.params;
    
    const result = await pool.query(`
      SELECT knowledge_id, entity_name, knowledge_type, description, canonical_facts, properties
      FROM lore_knowledge_graph
      WHERE knowledge_id = $1
    `, [knowledgeId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    res.json({
      success: true,
      entity: result.rows[0]
    });
  } catch (e) {
    console.error('[lore-entity] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});
router.post("/evaluate", async (req, res) => {
  try {
    const { task, characterId, answer } = req.body;
    
    if (!task || !characterId || !answer) {
      return res.status(400).json({ error: "task, characterId, and answer required" });
    }
    
    const evaluation = await LoreAnswerEvaluator.evaluateAndStore({
      task,
      characterId,
      answer
    });
    
    res.json({
      success: true,
      evaluation
    });
  } catch (e) {
    console.error("[lore-evaluate] Error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
