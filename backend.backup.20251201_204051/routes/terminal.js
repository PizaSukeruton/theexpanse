import express from 'express';
import TerminalCore from '../../../terminalCore.cjs';

const router = express.Router();
const terminal = new TerminalCore();

const looksLikeCouncilIntent = (s) => {
  const lower = s.toLowerCase().trim();
  return (
    lower.startsWith('who is') ||
    lower.startsWith('where is') ||
    lower.startsWith('show arc #') ||
    (lower.startsWith('what is the') && (lower.endsWith(' arc?') || lower.endsWith(' arc.'))) ||
    lower.startsWith('show details for event #') ||
    lower.startsWith('who was involved in event #') ||
    lower.startsWith('what events happened at ') ||
    lower.startsWith('what happened at ') ||
    lower.startsWith('list events with event_type ') ||
    lower.startsWith('list events since ') ||
    lower.startsWith('find events near ') ||
    lower.startsWith('list events in realm ') ||
    lower.startsWith('list events at ') ||
    (lower.startsWith('who was sight') && lower.includes(' at '))
  );
};

const stripArticles = (s) => s.replace(/\b(the|a|an)\b/gi, ' ').replace(/\s+/g, ' ').trim();

const normalizeCouncilQuery = (q) => {
  const lower = q.toLowerCase().trim();
  if (lower.startsWith('what happened at ')) {
    const restRaw = q.slice(q.toLowerCase().indexOf('what happened at ') + 'what happened at '.length);
    const rest = stripArticles(restRaw);
    return 'What events happened at ' + rest;
  }
  return q;
};

const tryParseCouncilText = (councilText) => {
  if (typeof councilText !== 'string') return null;
  const idx = councilText.indexOf('Found: ');
  const payload = idx >= 0 ? councilText.slice(idx + 7) : councilText;
  try { return JSON.parse(payload); } catch { return null; }
};

const summarizeEvent = (e) => {
  const id = e.event_id || e.id || '';
  const when = e.timestamp || '';
  const where = e.location || e.realm || '';
  const type = e.event_type || '';
  const threat = typeof e.threat_level === 'number' ? `T${e.threat_level}` : '';
  return `[${id}] ${when} :: ${where} :: ${type} ${threat}`.trim();
};

const detailEvent = (e) => {
  const lines = [];
  if (e.event_id) lines.push(`ID: ${e.event_id}`);
  if (e.timestamp) lines.push(`When: ${e.timestamp}`);
  if (e.realm) lines.push(`Realm: ${e.realm}`);
  if (e.location) lines.push(`Location: ${e.location}`);
  if (e.event_type) lines.push(`Type: ${e.event_type}`);
  if (typeof e.threat_level === 'number') lines.push(`Threat: ${e.threat_level}`);
  if (Array.isArray(e.involved_characters) && e.involved_characters.length) lines.push(`Involved: ${e.involved_characters.join(', ')}`);
  if (e.narrative_arc_id) lines.push(`Arc: ${e.narrative_arc_id}`);
  if (e.notes) lines.push(`Notes: ${e.notes}`);
  return lines.join('\n');
};

const summarizeCharacter = (c) => {
  const name = c.name || '(unknown)';
  const role = c.role ? ` :: ${c.role}` : '';
  const loc = c.current_location ? ` @ ${c.current_location}` : '';
  return `${name}${role}${loc}`.trim();
};

const summarizeLocation = (l) => {
  const name = l.name || '(unknown)';
  const realm = l.realm ? ` :: ${l.realm}` : '';
  return `${name}${realm}`.trim();
};

const summarizeArc = (a) => {
  const id = a.arc_id || '';
  const title = a.title || '(untitled)';
  const sum = a.summary ? ` — ${a.summary}` : '';
  return `[${id}] ${title}${sum}`.trim();
};

const formatCouncilAnswer = (q, council) => {
  const asJson = tryParseCouncilText(council?.text);
  const type = council?.type || 'ok';
  if (asJson == null) return { lines: [council?.text || 'NO_RESULT'], type };

  const lower = q.toLowerCase();
  const lines = [];

  if (Array.isArray(asJson)) {
    lines.push(`Found ${asJson.length} item(s):`);
    asJson.forEach((item) => {
      if ('event_id' in item || 'event_type' in item) lines.push(summarizeEvent(item));
      else if ('arc_id' in item || 'title' in item) lines.push(summarizeArc(item));
      else if ('species' in item || 'role' in item) lines.push(summarizeCharacter(item));
      else if ('realm' in item && 'name' in item) lines.push(summarizeLocation(item));
      else lines.push(JSON.stringify(item));
    });
  } else if (asJson && typeof asJson === 'object') {
    if (lower.startsWith('show details for event #') && ('event_id' in asJson || 'event_type' in asJson)) {
      lines.push(detailEvent(asJson));
    } else if ('event_id' in asJson || 'event_type' in asJson) {
      lines.push(summarizeEvent(asJson));
    } else if ('arc_id' in asJson || 'title' in asJson) {
      lines.push(summarizeArc(asJson));
    } else if ('species' in asJson || 'role' in asJson) {
      lines.push(summarizeCharacter(asJson));
    } else if ('realm' in asJson && 'name' in asJson) {
      lines.push(summarizeLocation(asJson));
    } else {
      lines.push(JSON.stringify(asJson));
    }
  } else {
    lines.push(String(asJson));
  }
  return { lines, type };
};

router.post('/query', async (req, res) => {
  const { question } = req.body || {};
  const userId = req.session?.userId || null;

  if (!question || !String(question).trim()) {
    return res.status(400).json({ error: 'NO_QUERY_PROVIDED', data: null });
  }

  const original = String(question).trim();
  const normalized = normalizeCouncilQuery(original);

  if (looksLikeCouncilIntent(normalized)) {
    try {
      const baseUrl = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
      const r = await fetch(`${baseUrl}/api/expanse/council/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: normalized })
      });
      const council = await r.json();

      const formatted = formatCouncilAnswer(normalized, council);
      const answer = formatted.lines.join('\n');

      const dataItem = {
        id: 'council:' + Buffer.from(normalized).toString('base64').slice(0, 8),
        question: original,
        answer
      };

      return res.json({ data: [dataItem], message: formatted.type || 'ok', access_level: 0 });
    } catch (e) {
      return res.status(502).json({ error: 'COUNCIL_PROXY_FAILED', detail: e.message, data: [] });
    }
  }

  const response = await terminal.processQuery(original, userId);
  return res.json(response);
});

export default router;

router.post('/logout', async (req, res) => {
  try {
    const { userId, sessionContext } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const sessionSummarizer = await import('../utils/sessionSummarizer.js').then(m => m.default);
    
    const summary = await sessionSummarizer.createSessionSummary(userId, sessionContext || {}, []);
    
    if (summary) {
      await sessionSummarizer.commitSessionToMemory(userId, summary);
    }

    res.json({
      success: true,
      farewell: `Thanks for exploring with me! I'll remember the ${summary?.entities_discussed?.length || 0} discoveries you made.`,
      session_summary: summary
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: error.message });
  }
});
