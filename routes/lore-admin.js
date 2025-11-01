import express from 'express';
import crypto from 'crypto';
import pool from '../backend/db/pool.js';

const router = express.Router();
const hexId = () => '#' + crypto.randomBytes(3).toString('hex').toUpperCase();

router.get('/test', (req, res) => {
  res.json({ message: 'Lore routes working!' });
});

router.get('/arcs/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'missing_q' });
    const like = '%' + q.replace(/[%_]/g, s => '\\' + s) + '%';
    const sql = `
      SELECT arc_id, title, summary, tags, keywords, created_at
      FROM story_arcs
      WHERE title ILIKE $1
         OR summary ILIKE $1
         OR EXISTS (SELECT 1 FROM unnest(tags) t WHERE t ILIKE $1)
         OR EXISTS (SELECT 1 FROM unnest(keywords) k WHERE k ILIKE $1)
      ORDER BY created_at DESC
      LIMIT 50
    `;
    const r = await pool.query(sql, [like]);
    res.json({ items: r.rows, q });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/arcs', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit ?? "50", 10), 200);
    const offset = Math.max(parseInt(req.query.offset ?? "0", 10), 0);
    const order = (req.query.order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
    const q = `
      SELECT arc_id, title, summary, tags, keywords, created_at
      FROM story_arcs
      ORDER BY created_at ${order}
      LIMIT $1 OFFSET $2
    `;
    const r = await pool.query(q, [limit, offset]);
    res.json({ items: r.rows, limit, offset, order });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/arcs', async (req, res) => {
  try {
    const { title, summary, tags, keywords } = req.body;
    if (!title || !summary) return res.status(400).json({ error: 'title and summary are required' });
    const arc_id = hexId();
    const toList = (v) => Array.isArray(v) ? v : (typeof v === 'string'
      ? v.split(',').map(s=>s.trim()).filter(Boolean) : null);
    const tagArr = toList(tags);
    const kwArr  = toList(keywords);
    const sql = `
      INSERT INTO story_arcs (arc_id, title, summary, tags, keywords)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING arc_id, title, summary, tags, keywords, created_at
    `;
    const vals = [arc_id, title, summary, tagArr, kwArr];
    const r = await pool.query(sql, vals);
    res.json(r.rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/arcs/:arc_id', async (req, res) => {
  try {
    const { arc_id } = req.params;
    const r = await pool.query(
      'SELECT arc_id, title, summary, tags, keywords, created_at FROM story_arcs WHERE arc_id = $1',
      [arc_id]
    );
    if (!r.rowCount) return res.status(404).json({ error: 'not_found' });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/arcs/by-hex/:hex', async (req, res) => {
  try {
    const arc_id = '#' + req.params.hex.toUpperCase();
    const r = await pool.query(
      'SELECT arc_id, title, summary, tags, keywords, created_at FROM story_arcs WHERE arc_id = $1',
      [arc_id]
    );
    if (!r.rowCount) return res.status(404).json({ error: 'not_found' });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/arcs/:arc_id', async (req, res) => {
  try {
    const { arc_id } = req.params;
    const { title, summary, tags, keywords } = req.body;
    const toList = (v) => Array.isArray(v) ? v : (typeof v === 'string'
      ? v.split(',').map(s=>s.trim()).filter(Boolean) : null);
    const t = toList(tags);
    const k = toList(keywords);
    const sql = `
      UPDATE story_arcs
         SET title = COALESCE($2, title),
             summary = COALESCE($3, summary),
             tags = COALESCE($4, tags),
             keywords = COALESCE($5, keywords)
       WHERE arc_id = $1
       RETURNING arc_id, title, summary, tags, keywords, created_at
    `;
    const vals = [arc_id, title ?? null, summary ?? null, t, k];
    const r = await pool.query(sql, vals);
    if (!r.rowCount) return res.status(404).json({ error: 'not_found' });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/arcs/:arc_id', async (req, res) => {
  try {
    const { arc_id } = req.params;
    const r = await pool.query('DELETE FROM story_arcs WHERE arc_id = $1 RETURNING arc_id', [arc_id]);
    if (!r.rowCount) return res.status(404).json({ error: 'not_found' });
    res.json({ ok: true, arc_id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
