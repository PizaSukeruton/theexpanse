import pool from "../../db/pool.js";

export default class EventGrounder {
  async ground(entity, characterId) {
    try {
      const [omiyageResult, psychicResult, multiverseResult] = await Promise.all([
        pool.query(
          `SELECT
            oe.event_id,
            oe.object_id,
            oe.giver_character_id,
            oe.receiver_character_id,
            oe.event_type,
            oe.gift_accepted,
            oe.emotional_context,
            oe.occurred_at,
            o.object_name,
            o.object_type
          FROM omiyage_events oe
          LEFT JOIN objects o ON oe.object_id = o.object_id
          WHERE oe.giver_character_id = $1
            OR oe.receiver_character_id = $1
          ORDER BY oe.occurred_at DESC
          LIMIT 10`,
          [characterId]
        ),
        pool.query(
          `SELECT
            pe.event_id,
            pe.source_character,
            pe.target_character,
            pe.event_type,
            pe.delta_p,
            pe.delta_a,
            pe.delta_d,
            pe.created_at
          FROM psychic_events pe
          WHERE pe.source_character = $1
            OR pe.target_character = $1
          ORDER BY pe.created_at DESC
          LIMIT 10`,
          [characterId]
        ),
        pool.query(
          `SELECT
            me.event_id,
            me.realm,
            me.location,
            me.event_type,
            me.threat_level,
            me.involved_characters,
            me.outcome,
            me.emotional_impact,
            me.notes,
            me.timestamp
          FROM multiverse_events me
          WHERE me.involved_characters @> $1::jsonb
            OR me.involved_characters @> $2::jsonb
          ORDER BY me.timestamp DESC
          LIMIT 10`,
          [JSON.stringify([characterId]), JSON.stringify([characterId.replace(/^#/, "")])]
        )
      ]);

      const omiyage = omiyageResult.rows;
      const psychic = psychicResult.rows;
      const multiverse = multiverseResult.rows;

      const relatedOmiyage = omiyage.filter(o =>
        this.matchEvent(entity, o, ["object_name", "event_type", "emotional_context"])
      );
      const relatedPsychic = psychic.filter(p =>
        this.matchEvent(entity, p, ["event_type"])
      );
      const relatedMultiverse = multiverse.filter(m =>
        this.matchEvent(entity, m, ["event_type", "location", "realm", "outcome", "notes"])
      );

      return {
        entity,
        characterId,
        groundedEvents: {
          hasOmiyageMatch: relatedOmiyage.length > 0,
          hasPsychicMatch: relatedPsychic.length > 0,
          hasMultiverseMatch: relatedMultiverse.length > 0,
          relatedOmiyage,
          relatedPsychic,
          relatedMultiverse,
          allOmiyage: omiyage,
          allPsychic: psychic,
          allMultiverse: multiverse
        },
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error("EventGrounder error:", err.message);
      return {
        entity,
        characterId,
        groundedEvents: {
          hasOmiyageMatch: false,
          hasPsychicMatch: false,
          hasMultiverseMatch: false,
          relatedOmiyage: [],
          relatedPsychic: [],
          relatedMultiverse: [],
          allOmiyage: [],
          allPsychic: [],
          allMultiverse: []
        },
        error: err.message
      };
    }
  }

  matchEvent(query, event, fields) {
    if (!query || !event) return false;
    const q = String(query).toLowerCase();
    const fieldList = Array.isArray(fields) ? fields : [fields];
    return fieldList.some(f => {
      const value = event[f];
      if (value == null) return false;
      const s = typeof value === "string" ? value : JSON.stringify(value);
      return s.toLowerCase().includes(q);
    });
  }

  translatePAD(deltaP, deltaA, deltaD) {
    const p = Number(deltaP) || 0;
    const a = Number(deltaA) || 0;
    const d = Number(deltaD) || 0;

    const phrases = [];

    if (p > 5) phrases.push("left me warm");
    else if (p > 0) phrases.push("brought a gentle joy");
    else if (p < -5) phrases.push("left me hollow");
    else if (p < 0) phrases.push("cast a shadow");

    if (a > 5) phrases.push("set me alight");
    else if (a > 0) phrases.push("quickened my pulse");
    else if (a < -5) phrases.push("left me numb");
    else if (a < 0) phrases.push("settled my mind");

    if (d > 5) phrases.push("made me bold");
    else if (d > 0) phrases.push("strengthened my resolve");
    else if (d < -5) phrases.push("diminished me");
    else if (d < 0) phrases.push("gave me humility");

    return phrases.length > 0 ? phrases.join(", ") : "shifted something in me";
  }
}

export function generateEventStatement(eventContext) {
  if (!eventContext || !eventContext.groundedEvents) return "";

  const ge = eventContext.groundedEvents || {};
  const characterId = eventContext.characterId;
  const grounder = new EventGrounder();

  if (ge.hasOmiyageMatch && ge.relatedOmiyage && ge.relatedOmiyage.length) {
    const e = ge.relatedOmiyage[0];
    const objName = e.object_name || "a gift";
    const wasReceiver = e.receiver_character_id === characterId;
    if (wasReceiver && e.gift_accepted) {
      return `I received ${objName}, and it shaped me.`;
    } else if (wasReceiver) {
      return `${objName} was offered to me.`;
    } else {
      return `I gave ${objName} as omiyage.`;
    }
  }

  if (ge.allOmiyage && ge.allOmiyage.length) {
    const e = ge.allOmiyage[0];
    const objName = e.object_name || "a gift";
    const wasReceiver = e.receiver_character_id === characterId;
    return wasReceiver ? `I carry the memory of ${objName}.` : `An omiyage I gave still echoes.`;
  }

  if (ge.hasPsychicMatch && ge.relatedPsychic && ge.relatedPsychic.length) {
    const e = ge.relatedPsychic[0];
    const translation = grounder.translatePAD(e.delta_p, e.delta_a, e.delta_d);
    return `A psychic shift: ${translation}.`;
  }

  if (ge.allPsychic && ge.allPsychic.length) {
    const e = ge.allPsychic[0];
    const translation = grounder.translatePAD(e.delta_p, e.delta_a, e.delta_d);
    return `I felt the multiverse ${translation}.`;
  }

  if (ge.hasMultiverseMatch && ge.relatedMultiverse && ge.relatedMultiverse.length) {
    const e = ge.relatedMultiverse[0];
    const threatLevel = Number(e.threat_level) || 0;
    if (threatLevel >= 7) {
      return `I witnessed a perilous moment in ${e.location || "the multiverse"}.`;
    }
    return `Something shifted in ${e.location || "the realm"}.`;
  }

  if (ge.allMultiverse && ge.allMultiverse.length) {
    const e = ge.allMultiverse[0];
    return `I remember an event in ${e.realm || "the broader realm"}.`;
  }

  return "";
}
