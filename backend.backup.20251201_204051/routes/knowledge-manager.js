import express from 'express';
import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const router = express.Router();

const CLAUDE_ID = '#700002';

router.post('/create-fact', async (req, res) => {
  try {
    const { 
      fact_text, 
      domain_id, 
      difficulty, 
      related_characters, 
      tags
    } = req.body;

    if (!fact_text || !domain_id) {
      return res.status(400).json({ error: 'fact_text and domain_id required' });
    }

    const knowledge_id = await generateHexId('knowledge_item_id');

    await pool.query(`
      INSERT INTO knowledge_items 
      (knowledge_id, content, domain_id, source_type, complexity_score, initial_character_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      knowledge_id,
      JSON.stringify({
        type: 'fact',
        statement: fact_text,
        tags: tags || [],
        difficulty: difficulty || 'medium'
      }),
      domain_id,
      'admin_entry',
      (difficulty === 'hard' ? 0.8 : difficulty === 'medium' ? 0.5 : 0.3),
      CLAUDE_ID
    ]);

    if (related_characters && related_characters.length > 0) {
      for (const char_id of related_characters) {
        await pool.query(`
          INSERT INTO character_knowledge_state 
          (character_id, knowledge_id, current_retrievability, stability, difficulty)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [char_id, knowledge_id, 0.5, 3, 2]);
      }
    }

    res.json({
      success: true,
      knowledge_id,
      initial_character_id: CLAUDE_ID,
      keeper: 'Claude The Tanuki',
      message: `Fact created by Claude and assigned to ${related_characters?.length || 0} characters`
    });

  } catch (e) {
    console.error('[create-fact] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.get('/domains', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT domain_id, domain_name, description, is_active
      FROM knowledge_domains
      WHERE is_active = true
      ORDER BY domain_name
    `);

    res.json({
      success: true,
      domains: result.rows
    });
  } catch (e) {
    console.error('[domains] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.post('/create-domain', async (req, res) => {
  try {
    const { domain_name, description } = req.body;

    if (!domain_name) {
      return res.status(400).json({ error: 'domain_name required' });
    }

    const domain_id = await generateHexId('knowledge_domain_id');

    await pool.query(`
      INSERT INTO knowledge_domains 
      (domain_id, domain_name, description, is_active)
      VALUES ($1, $2, $3, $4)
    `, [domain_id, domain_name, description || '', true]);

    res.json({
      success: true,
      domain_id,
      message: `Domain "${domain_name}" created`
    });

  } catch (e) {
    console.error('[create-domain] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.get('/characters', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT character_id, character_name, category
      FROM character_profiles
      WHERE is_active = true
      ORDER BY character_name
    `);

    res.json({
      success: true,
      characters: result.rows
    });
  } catch (e) {
    console.error('[characters] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.get('/facts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT k.knowledge_id, k.content, d.domain_name, k.complexity_score, k.initial_character_id
      FROM knowledge_items k
      LEFT JOIN knowledge_domains d ON k.domain_id = d.domain_id
      WHERE k.source_type = 'admin_entry'
      ORDER BY k.acquisition_timestamp DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      facts: result.rows,
      count: result.rows.length,
      keeper: 'Claude The Tanuki'
    });
  } catch (e) {
    console.error('[facts] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
