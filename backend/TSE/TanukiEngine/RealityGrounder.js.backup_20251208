import pool from "../../db/pool.js";

export default class RealityGrounder {
  async ground(entity, characterId) {
    try {
      const inventory = await pool.query(
        `SELECT
           ci.inventory_entry_id,
           ci.object_id,
           o.object_name,
           ci.acquisition_method,
           ci.source_character_id,
           ci.acquired_at
         FROM character_inventory ci
         JOIN objects o ON ci.object_id = o.object_id
         WHERE ci.character_id = $1
         ORDER BY ci.acquired_at DESC`,
        [characterId]
      );

      const traits = await pool.query(
        `SELECT
           ch.trait_name,
           cts.percentile_score,
           ch.hex_color
         FROM character_trait_scores cts
         JOIN characteristics ch ON cts.trait_hex_color = ch.hex_color
         WHERE cts.character_hex_id = $1
         ORDER BY cts.percentile_score DESC`,
        [characterId]
      );

      const knowledge = await pool.query(
        `SELECT
           cksm.domain_id,
           kd.domain_name,
           cksm.access_percentage
         FROM character_knowledge_slot_mappings cksm
         JOIN knowledge_domains kd ON cksm.domain_id = kd.domain_id
         WHERE cksm.character_id = $1
           AND cksm.is_active = true
         ORDER BY cksm.access_percentage DESC`,
        [characterId]
      );

      const hasInventoryMatch = this.matchEntity(entity, inventory.rows, "object_name");
      const hasTraitMatch = this.matchEntity(entity, traits.rows, "trait_name");
      const hasKnowledgeMatch = this.matchEntity(entity, knowledge.rows, "domain_name");

      return {
        entity,
        characterId,
        inventory: inventory.rows,
        traits: traits.rows,
        knowledge: knowledge.rows,
        groundedReality: {
          hasInventoryMatch,
          hasTraitMatch,
          hasKnowledgeMatch,
          relatedInventory: hasInventoryMatch ? inventory.rows : [],
          relevantTraits: hasTraitMatch ? traits.rows : [],
          accessibleKnowledge: hasKnowledgeMatch ? knowledge.rows : []
        },
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error("RealityGrounder error:", err.message);
      return {
        entity,
        characterId,
        inventory: [],
        traits: [],
        knowledge: [],
        groundedReality: null,
        error: err.message
      };
    }
  }

  matchEntity(query, items, field) {
    if (!query || !items || !items.length) return false;
    const q = String(query).toLowerCase();
    return items.some(item =>
      String(item[field] || "").toLowerCase().includes(q)
    );
  }
}

export function generateGroundedStatement(groundedContext) {
  if (!groundedContext) return "";

  const gr = groundedContext.groundedReality || {};
  const inventory = groundedContext.inventory || [];
  const traits = groundedContext.traits || [];
  const knowledge = groundedContext.knowledge || [];

  const invList = gr.hasInventoryMatch && gr.relatedInventory && gr.relatedInventory.length
    ? gr.relatedInventory
    : inventory.slice(0, 2);

  if (invList && invList.length) {
    const names = invList.slice(0, 2).map(i => i.object_name);
    return `I carry ${names.join(" and ")}.`;
  }

  const knowList = gr.hasKnowledgeMatch && gr.accessibleKnowledge && gr.accessibleKnowledge.length
    ? gr.accessibleKnowledge
    : knowledge.slice(0, 1);

  if (knowList && knowList.length) {
    const top = knowList[0];
    if (top.access_percentage >= 80) {
      return `I've deeply studied ${top.domain_name}.`;
    }
    if (top.access_percentage >= 50) {
      return `I know something of ${top.domain_name}, though there are gaps.`;
    }
    return `I'm still learning about ${top.domain_name}.`;
  }

  const traitList = gr.hasTraitMatch && gr.relevantTraits && gr.relevantTraits.length
    ? gr.relevantTraits
    : traits.slice(0, 1);

  if (traitList && traitList.length) {
    const t = traitList[0];
    if (t.percentile_score >= 80) {
      return `This touches on something I'm strong in: ${t.trait_name}.`;
    }
    if (t.percentile_score >= 50) {
      return `I'm working on my ${t.trait_name}.`;
    }
    return `My ${t.trait_name} is still developing.`;
  }

  return "";
}
