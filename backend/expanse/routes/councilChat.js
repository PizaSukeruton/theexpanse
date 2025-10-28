import express from 'express';
const router = express.Router();
import pool from '../../db/pgPool.js';

const stripArticles = (s) => s.replace(/\b(the|a|an)\b/gi, ' ').replace(/\s+/g, ' ').trim();

const extractId = (text, prefixRegex) => {
  const m = text.match(prefixRegex);
  return m ? `#${m[1].toUpperCase()}` : null;
};

const extractLimitOffset = (text) => {
  const lim = text.match(/limit\s+(\d{1,3})/i);
  const off = text.match(/offset\s+(\d{1,5})/i);
  const limit = lim ? Math.min(parseInt(lim[1], 10), 100) : 50;
  const offset = off ? Math.min(parseInt(off[1], 10), 10000) : 0;
  return { limit, offset };
};

const extractSort = (text) => {
  const m = text.match(/\bsort\s+(asc|desc)\b/i);
  return m ? m[1].toUpperCase() : 'DESC';
};

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: 'message is required' });

    const lower = message.toLowerCase().trim();
    let response = { text: 'Query not recognized.', type: 'error' };

    if (lower.startsWith('who is')) {
      const name = lower.replace(/^who is\s+/, '').replace(/\?+$/, '').trim();
      const r = await pool.query('SELECT * FROM characters WHERE LOWER(name) = $1', [name]);
      response = r.rows[0] ? { text: 'Found: ' + JSON.stringify(r.rows[0]), type: 'success' } : { text: 'No match found.', type: 'not_found' };
      return res.json(response);
    }

    if (lower.startsWith('where is')) {
      const loc = lower.replace(/^where is\s+/, '').replace(/\?+$/, '').trim();
      const r = await pool.query('SELECT * FROM locations WHERE LOWER(name) = $1', [loc]);
      response = r.rows[0] ? { text: 'Found: ' + JSON.stringify(r.rows[0]), type: 'success' } : { text: 'No match found.', type: 'not_found' };
      return res.json(response);
    }

    if (lower.startsWith('show arc #')) {
      const arcId = extractId(lower, /#([0-9a-z]{6,7})/i);
      if (!arcId) return res.json({ text: 'Invalid arc id.', type: 'error' });
      const r = await pool.query('SELECT * FROM story_arcs WHERE arc_id = $1', [arcId]);
      response = r.rows[0] ? { text: 'Found: ' + JSON.stringify(r.rows[0]), type: 'success' } : { text: 'No match found.', type: 'not_found' };
      return res.json(response);
    }

    if (lower.endsWith(' arc?') || lower.endsWith(' arc.')) {
      const title = lower.replace(/^what\s+is\s+the\s+/, '').replace(/\s+arc[\?\.]*$/, '').trim();
      if (title) {
        const r = await pool.query('SELECT * FROM story_arcs WHERE LOWER(title) = $1', [title]);
        response = r.rows[0] ? { text: 'Found: ' + JSON.stringify(r.rows[0]), type: 'success' } : { text: 'No match found.', type: 'not_found' };
      }
      return res.json(response);
    }

    if (lower.startsWith('show details for event #')) {
      const eventId = extractId(lower, /#([0-9a-z]{6,7})/i);
      if (!eventId) return res.json({ text: 'Invalid event id.', type: 'error' });
      const r = await pool.query('SELECT * FROM multiverse_events WHERE event_id = $1', [eventId]);
      response = r.rows[0] ? { text: 'Found: ' + JSON.stringify(r.rows[0]), type: 'success' } : { text: 'No match found.', type: 'not_found' };
      return res.json(response);
    }

    if (lower.startsWith('who was involved in event #')) {
      const eventId = extractId(lower, /#([0-9a-z]{6,7})/i);
      if (!eventId) return res.json({ text: 'Invalid event id.', type: 'error' });
      const r = await pool.query('SELECT involved_characters FROM multiverse_events WHERE event_id = $1', [eventId]);
      response = r.rows[0]?.involved_characters ? { text: 'Involved: ' + JSON.stringify(r.rows[0].involved_characters), type: 'success' } : { text: 'No match found.', type: 'not_found' };
      return res.json(response);
    }

    if (lower.startsWith('who was at ')) {
      const locRaw = lower.replace(/^who was at\s+/, '').replace(/\?+$/, '').trim();
      const loc = stripArticles(locRaw);
      const likeLoc = `%${loc}%`;
      const r = await pool.query(
        `SELECT involved_characters FROM multiverse_events
         WHERE location ILIKE $1
         ORDER BY timestamp DESC LIMIT 500`,
        [likeLoc]
      );
      const set = new Set();
      r.rows.forEach(row => Array.isArray(row.involved_characters) && row.involved_characters.forEach(ch => set.add(ch)));
      const list = Array.from(set);
      response = list.length ? { text: 'Involved: ' + JSON.stringify(list), type: 'success' } : { text: 'No match found.', type: 'not_found' };
      return res.json(response);
    }

    if (lower.startsWith('who was sight') && lower.includes(' at ')) {
      const locRaw = lower.replace(/^who was sight(?:ed|ing)\s+at\s+/, '').replace(/\?+$/, '').trim();
      const loc = stripArticles(locRaw);
      const likeLoc = `%${loc}%`;
      const likeType = `%sight%`;
      const r = await pool.query(
        `SELECT involved_characters FROM multiverse_events
         WHERE location ILIKE $1 AND event_type ILIKE $2
         ORDER BY timestamp DESC LIMIT 200`,
        [likeLoc, likeType]
      );
      const set = new Set();
      r.rows.forEach(row => Array.isArray(row.involved_characters) && row.involved_characters.forEach(ch => set.add(ch)));
      const list = Array.from(set);
      response = list.length ? { text: 'Involved: ' + JSON.stringify(list), type: 'success' } : { text: 'No match found.', type: 'not_found' };
      return res.json(response);
    }

    if (lower.startsWith('what events happened at ')) {
      const { limit, offset } = extractLimitOffset(lower);
      const sort = extractSort(lower);
      const locRaw = lower.replace(/^what events happened at\s+/, '').replace(/\?+$/, '').trim().split(/\s+limit/)[0].split(/\s+sort/)[0].trim();
      const like = `%${stripArticles(locRaw)}%`;
      const r = await pool.query(
        `SELECT * FROM multiverse_events
         WHERE location ILIKE $1
         ORDER BY timestamp ${sort}
         LIMIT $2 OFFSET $3`,
        [like, limit, offset]
      );
      response = r.rows.length ? { text: 'Found: ' + JSON.stringify(r.rows), type: 'success' } : { text: 'No match found.', type: 'not_found' };
      return res.json(response);
    }

    if (lower.startsWith('list events at ')) {
      const { limit, offset } = extractLimitOffset(lower);
      const sort = extractSort(lower);
      const withoutLead = lower.replace(/^list events at\s+/, '').replace(/\?+$/, '').trim();
      const parts = withoutLead.split(/\s+since\s+/i);
      const loc = stripArticles(parts[0].split(/\s+limit/)[0].split(/\s+sort/)[0].trim());
      const like = `%${loc}%`;
      let since = null;
      if (parts[1]) {
        since = parts[1].split(/\s+limit/)[0].split(/\s+sort/)[0].trim();
      }
      const sql = since
        ? `SELECT * FROM multiverse_events WHERE location ILIKE $1 AND timestamp >= $2 ORDER BY timestamp ${sort} LIMIT $3 OFFSET $4`
        : `SELECT * FROM multiverse_events WHERE location ILIKE $1 ORDER BY timestamp ${sort} LIMIT $2 OFFSET $3`;
      const params = since ? [like, since, limit, offset] : [like, limit, offset];
      const r = await pool.query(sql, params);
      response = r.rows.length ? { text: 'Found: ' + JSON.stringify(r.rows), type: 'success' } : { text: 'No match found.', type: 'not_found' };
      return res.json(response);
    }

    if (lower.startsWith('list events with event_type ')) {
      const { limit, offset } = extractLimitOffset(lower);
      const sort = extractSort(lower);
      const typ = lower.replace(/^list events with event_type\s+/, '').replace(/\?+$/, '').trim().split(/\s+limit/)[0].split(/\s+sort/)[0].trim();
      const r = await pool.query(
        `SELECT * FROM multiverse_events WHERE LOWER(event_type) = $1 ORDER BY timestamp ${sort} LIMIT $2 OFFSET $3`,
        [typ, limit, offset]
      );
      response = r.rows.length ? { text: 'Found: ' + JSON.stringify(r.rows), type: 'success' } : { text: 'No match found.', type: 'not_found' };
      return res.json(response);
    }

    if (lower.startsWith('list events since ')) {
      const { limit, offset } = extractLimitOffset(lower);
      const sort = extractSort(lower);
      const since = lower.replace(/^list events since\s+/, '').replace(/\?+$/, '').trim().split(/\s+limit/)[0].split(/\s+sort/)[0].trim();
      const r = await pool.query(
        `SELECT * FROM multiverse_events WHERE timestamp >= $1 ORDER BY timestamp ${sort} LIMIT $2 OFFSET $3`,
        [since, limit, offset]
      );
      response = r.rows.length ? { text: 'Found: ' + JSON.stringify(r.rows), type: 'success' } : { text: 'No match found.', type: 'not_found' };
      return res.json(response);
    }

    if (lower.startsWith('find events near ')) {
      const { limit, offset } = extractLimitOffset(lower);
      const term = lower.replace(/^find events near\s+/, '').replace(/\?+$/, '').trim().split(/\s+limit/)[0].trim();
      const like = `%${term}%`;
      const r = await pool.query(
        `SELECT * FROM multiverse_events
         WHERE location ILIKE $1 OR notes ILIKE $1 OR event_type ILIKE $1
         ORDER BY timestamp DESC LIMIT $2 OFFSET $3`,
        [like, limit, offset]
      );
      response = r.rows.length ? { text: 'Found: ' + JSON.stringify(r.rows), type: 'success' } : { text: 'No match found.', type: 'not_found' };
      return res.json(response);
    }

    if (lower.startsWith('list events in realm ')) {
      const { limit, offset } = extractLimitOffset(lower);
      const sort = extractSort(lower);
      const realm = lower.replace(/^list events in realm\s+/, '').replace(/\?+$/, '').trim().split(/\s+limit/)[0].split(/\s+sort/)[0].trim();
      const r = await pool.query(
        `SELECT * FROM multiverse_events WHERE LOWER(realm) = $1 ORDER BY timestamp ${sort} LIMIT $2 OFFSET $3`,
        [realm, limit, offset]
      );
      response = r.rows.length ? { text: 'Found: ' + JSON.stringify(r.rows), type: 'success' } : { text: 'No match found.', type: 'not_found' };
      return res.json(response);
    }

    if (lower.startsWith('who was in realm ')) {
      const rest = lower.replace(/^who was in realm\s+/, '').replace(/\?+$/, '').trim();
      const parts = rest.split(/\s+since\s+/i);
      const realm = parts[0].trim();
      const since = parts[1]?.trim().split(/\s+/)[0] ?? null;
      if (since) {
        const r = await pool.query(
          `SELECT involved_characters FROM multiverse_events WHERE LOWER(realm) = $1 AND timestamp >= $2 ORDER BY timestamp DESC LIMIT 2000`,
          [realm, since]
        );
        const set = new Set();
        r.rows.forEach(row => Array.isArray(row.involved_characters) && row.involved_characters.forEach(ch => set.add(ch)));
        const list = Array.from(set);
        return res.json(list.length ? { text: 'Involved: ' + JSON.stringify(list), type: 'success' } : { text: 'No match found.', type: 'not_found' });
      } else {
        const r = await pool.query(
          `SELECT involved_characters FROM multiverse_events WHERE LOWER(realm) = $1 ORDER BY timestamp DESC LIMIT 2000`,
          [realm]
        );
        const set = new Set();
        r.rows.forEach(row => Array.isArray(row.involved_characters) && row.involved_characters.forEach(ch => set.add(ch)));
        const list = Array.from(set);
        return res.json(list.length ? { text: 'Involved: ' + JSON.stringify(list), type: 'success' } : { text: 'No match found.', type: 'not_found' });
      }
    }

    return res.json(response);
  } catch (error) {
    console.error('Council chat error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
