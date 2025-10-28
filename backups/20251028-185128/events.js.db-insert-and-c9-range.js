import express from "express";
import generateAokHexId from "../../utils/hexIdGenerator.js";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      timestamp,
      realm,
      location,
      coords,
      event_type,
      threat_level,
      involved_characters,
      outcome,
      access_level,
      narrative_arc_id,
      notes
    } = req.body || {};

    if (!timestamp || !realm || !location || !event_type) {
      return res.status(400).json({ error: "timestamp, realm, location, event_type are required" });
    }

    const event_id = await generateAokHexId("multiverse_event_id");
    try {
      const pool = (await import("../../db/pgPool.js")).default;
      await pool.query(
        `INSERT INTO multiverse_events
         (event_id, timestamp, realm, location, coords, event_type, threat_level, involved_characters, outcome, access_level, narrative_arc_id, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          event_id,
          timestamp,
          realm,
          location,
          coords ? JSON.stringify(coords) : null,
          event_type,
          Number(threat_level ?? 0),
          JSON.stringify(Array.isArray(involved_characters) ? involved_characters : (involved_characters ? [involved_characters] : [])),
          outcome || "pending",
          Number(access_level ?? 2),
          narrative_arc_id || null,
          notes || null
        ]
      );
    } catch (e) {
      console.error("DB insert failed:", e.message);
    }

    const saved = {
      event_id,
      timestamp,
      realm,
      location,
      coords: coords ?? null,
      event_type,
      threat_level: Number(threat_level ?? 0),
      involved_characters: Array.isArray(involved_characters)
        ? involved_characters
        : (involved_characters ? [involved_characters] : []),
      outcome: outcome || "pending",
      access_level: Number(access_level ?? 2),
      narrative_arc_id: narrative_arc_id || null,
      notes: notes || null
    };

    return res.status(201).json(saved);
  } catch (err) {
    console.error("POST /api/expanse/events failed:", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

export default router;

// Temporary in-memory store for quick verification
const __recent = global.__recent_expanse_events || [];
global.__recent_expanse_events = __recent;

// Patch POST to record events in-memory without changing existing logic
const __origPost = router.stack.find(l => l.route && l.route.path === '/' && l.route.methods.post);
if (__origPost && !router.__patched_recent) {
  const origHandler = __origPost.route.stack[0].handle;
  __origPost.route.stack[0].handle = async (req, res, next) => {
    const oldJson = res.json.bind(res);
    res.json = (body) => {
      if (body && body.event_id) {
        __recent.unshift(body);
        if (__recent.length > 50) __recent.pop();
      }
      return oldJson(body);
    };
    return origHandler(req, res, next);
  };
  router.__patched_recent = true;
}

// GET /api/expanse/events — returns recent in-memory events
router.get("/", (_req, res) => {
  res.json({ events: __recent, count: __recent.length });
});

