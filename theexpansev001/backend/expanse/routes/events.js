import express from "express";
import generateAokHexId from "../../utils/hexIdGenerator.js";
import { triggerEventEmotionalImpact } from "../../eventPsychicTrigger.js";

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
      notes,
      emotional_impact
    } = req.body || {};

    if (!timestamp || !realm || !location || !event_type) {
      return res.status(400).json({ error: "timestamp, realm, location, event_type are required" });
    }

    const event_id = await generateAokHexId("multiverse_event_id");
    try {
      const pool = (await import("../../db/pool.js")).default;
      await pool.query(
        `INSERT INTO multiverse_events
         (event_id, timestamp, realm, location, coords, event_type, threat_level, involved_characters, outcome, access_level, narrative_arc_id, notes, emotional_impact)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
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
          notes || null,
          emotional_impact ? JSON.stringify(emotional_impact) : null
        ]
      );
      
      if (emotional_impact && involved_characters && Array.isArray(involved_characters) && involved_characters.length > 0) {
        try {
          await triggerEventEmotionalImpact(event_id);
          console.log(`✅ Triggered emotional impact for event ${event_id}`);
        } catch (triggerError) {
          console.error(`Failed to trigger emotional impact for ${event_id}:`, triggerError.message);
        }
      }
      
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
      notes: notes || null,
      emotional_impact: emotional_impact || null
    };

    return res.status(201).json(saved);
  } catch (err) {
    console.error("POST /api/expanse/events failed:", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

export default router;

const __recent = global.__recent_expanse_events || [];
global.__recent_expanse_events = __recent;

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

router.get("/", (_req, res) => {
  res.json({ events: __recent, count: __recent.length });
});

router.get("/by-arc/:arc_id", async (req, res) => {
  try {
    const arc_id = req.params.arc_id;
    if (!/^#[0-9A-F]{6}$/i.test(arc_id)) {
      return res.status(400).json({ error: "invalid_arc_id" });
    }
    const pool = (await import("../../db/pool.js")).default;
    const { rows } = await pool.query(
      `SELECT event_id, timestamp, realm, location, coords, event_type, threat_level,
              involved_characters, outcome, access_level, narrative_arc_id, notes, emotional_impact
       FROM multiverse_events
       WHERE narrative_arc_id = $1
       ORDER BY timestamp DESC
       LIMIT 200`,
      [arc_id]
    );
    return res.json({ events: rows, count: rows.length });
  } catch (e) {
    console.error("GET /api/expanse/events/by-arc/:arc_id failed:", e.message);
    return res.status(500).json({ error: "internal_error" });
  }
});

router.get("/:event_id", async (req, res) => {
  try {
    const { event_id } = req.params;
    if (!/^#[0-9A-F]{6}$/i.test(event_id)) {
      return res.status(400).json({ error: "invalid_event_id" });
    }
    const pool = (await import("../../db/pool.js")).default;
    const { rows } = await pool.query(
      `SELECT event_id, timestamp, realm, location, coords, event_type, threat_level,
              involved_characters, outcome, access_level, narrative_arc_id, notes, emotional_impact
       FROM multiverse_events
       WHERE event_id = $1
       LIMIT 1`,
      [event_id]
    );
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    return res.json(rows[0]);
  } catch (e) {
    console.error("GET /api/expanse/events/:event_id failed:", e.message);
    return res.status(500).json({ error: "internal_error" });
  }
});
