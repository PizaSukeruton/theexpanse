import pool from "../../db/pool.js";

export default class RelationshipGrounder {
  async ground(entity, characterId) {
    try {
      const outgoing = await pool.query(
        `SELECT
           hr.source_hex,
           hr.target_hex,
           hr.relationship_type,
           hr.metadata,
           rt.type_name,
           rt.description AS type_description,
           e.entity_name AS target_name,
           e.entity_type AS target_type
         FROM hex_relationships hr
         JOIN relationship_types rt
           ON hr.relationship_type = rt.type_name
         JOIN entities e
           ON e.entity_id = hr.target_hex
         WHERE hr.source_hex = $1`,
        [characterId]
      );

      const incoming = await pool.query(
        `SELECT
           hr.source_hex,
           hr.target_hex,
           hr.relationship_type,
           hr.metadata,
           rt.type_name,
           rt.description AS type_description,
           e.entity_name AS source_name,
           e.entity_type AS source_type
         FROM hex_relationships hr
         JOIN relationship_types rt
           ON hr.relationship_type = rt.type_name
         JOIN entities e
           ON e.entity_id = hr.source_hex
         WHERE hr.target_hex = $1`,
        [characterId]
      );

      const hasOutgoingMatch = this.matchEntity(entity, outgoing.rows, ["target_name", "type_name", "relationship_type"]);
      const hasIncomingMatch = this.matchEntity(entity, incoming.rows, ["source_name", "type_name", "relationship_type"]);

      return {
        entity,
        characterId,
        groundedRelationships: {
          hasOutgoingMatch,
          hasIncomingMatch,
          relatedOutgoing: outgoing.rows,
          relatedIncoming: incoming.rows
        },
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error("RelationshipGrounder error:", err.message);
      return {
        entity,
        characterId,
        groundedRelationships: {
          hasOutgoingMatch: false,
          hasIncomingMatch: false,
          relatedOutgoing: [],
          relatedIncoming: []
        },
        error: err.message
      };
    }
  }

  matchEntity(query, items, fields) {
    if (!query || !items || !items.length) return false;
    const q = String(query).toLowerCase();
    const fieldList = Array.isArray(fields) ? fields : [fields];
    return items.some(item =>
      fieldList.some(f => String(item[f] || "").toLowerCase().includes(q))
    );
  }
}

export function generateRelationshipStatement(relationshipContext) {
  const gr = relationshipContext && relationshipContext.groundedRelationships;
  if (!gr) return "";

  const outgoing = gr.relatedOutgoing || [];
  const incoming = gr.relatedIncoming || [];

  if (gr.hasOutgoingMatch && outgoing.length) {
    const names = outgoing.slice(0, 2).map(r => r.target_name || r.relationship_type || "someone");
    return `I have bonds reaching toward ${names.join(" and ")}.`;
  }

  if (gr.hasIncomingMatch && incoming.length) {
    const names = incoming.slice(0, 2).map(r => r.source_name || r.relationship_type || "someone");
    return `${names.join(" and ")} are tied to my story.`;
  }

  return "";
}
