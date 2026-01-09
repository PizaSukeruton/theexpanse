import pool from "../../db/pool.js";

export default class RelationshipGrounder {
  async ground(entity, characterId) {
    try {
      const [outgoingResult, incomingResult] = await Promise.all([
        pool.query(
          `SELECT
            hr.relationship_id,
            hr.source_hex,
            hr.target_hex,
            hr.relationship_type,
            hr.metadata,
            e.entity_name,
            e.entity_type,
            e.entity_id
          FROM hex_relationships hr
          LEFT JOIN entities e ON e.entity_id = hr.target_hex
          WHERE hr.source_hex = $1
          ORDER BY hr.created_at DESC
          LIMIT 20`,
          [characterId]
        ),
        pool.query(
          `SELECT
            hr.relationship_id,
            hr.source_hex,
            hr.target_hex,
            hr.relationship_type,
            hr.metadata,
            e.entity_name,
            e.entity_type,
            e.entity_id
          FROM hex_relationships hr
          LEFT JOIN entities e ON e.entity_id = hr.source_hex
          WHERE hr.target_hex = $1
          ORDER BY hr.created_at DESC
          LIMIT 20`,
          [characterId]
        )
      ]);

      const outgoing = outgoingResult.rows;
      const incoming = incomingResult.rows;

      const relatedOutgoing = outgoing.filter(r =>
        this.matchRelationship(entity, r)
      );
      const relatedIncoming = incoming.filter(r =>
        this.matchRelationship(entity, r)
      );

      return {
        entity,
        characterId,
        groundedRelationships: {
          hasOutgoingMatch: relatedOutgoing.length > 0,
          hasIncomingMatch: relatedIncoming.length > 0,
          relatedOutgoing,
          relatedIncoming,
          allOutgoing: outgoing,
          allIncoming: incoming
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
          relatedIncoming: [],
          allOutgoing: [],
          allIncoming: []
        },
        error: err.message
      };
    }
  }

  matchRelationship(query, relationship) {
    if (!query || !relationship) return false;
    const q = String(query).toLowerCase();
    const entityName = String(relationship.entity_name || "").toLowerCase();
    const relationType = String(relationship.relationship_type || "").toLowerCase();
    return entityName.includes(q) || relationType.includes(q);
  }
}

export function generateRelationshipStatement(relationshipContext) {
  if (!relationshipContext || !relationshipContext.groundedRelationships) return "";

  const gr = relationshipContext.groundedRelationships || {};
  const characterId = relationshipContext.characterId;

  if (gr.hasOutgoingMatch && gr.relatedOutgoing && gr.relatedOutgoing.length) {
    const rel = gr.relatedOutgoing[0];
    const name = rel.entity_name || "someone";
    const type = rel.relationship_type || "bond";
    return `I reach toward ${name} as a ${type}.`;
  }

  if (gr.allOutgoing && gr.allOutgoing.length) {
    const rel = gr.allOutgoing[0];
    const name = rel.entity_name || "someone";
    const type = rel.relationship_type || "connection";
    return `${name} is my ${type}.`;
  }

  if (gr.hasIncomingMatch && gr.relatedIncoming && gr.relatedIncoming.length) {
    const rel = gr.relatedIncoming[0];
    const name = rel.entity_name || "someone";
    const type = rel.relationship_type || "influence";
    return `${name} is tied to my story as a ${type}.`;
  }

  if (gr.allIncoming && gr.allIncoming.length) {
    const rel = gr.allIncoming[0];
    const name = rel.entity_name || "someone";
    return `${name} knows me.`;
  }

  return "";
}
