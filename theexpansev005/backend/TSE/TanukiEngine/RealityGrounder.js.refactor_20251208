import pool from "../../db/pool.js";

export default class RealityGrounder {
  async ground(entity, characterId) {
    try {
      const [inventoryResult, traitsResult, knowledgeResult] = await Promise.all([
        pool.query(
          `SELECT
            ci.inventory_entry_id,
            ci.object_id,
            o.object_name,
            o.object_type,
            o.rarity,
            ci.acquisition_method,
            ci.source_character_id,
            ci.acquired_at
          FROM character_inventory ci
          LEFT JOIN objects o ON ci.object_id = o.object_id
          WHERE ci.character_id = $1
          ORDER BY ci.acquired_at DESC
          LIMIT 20`,
          [characterId]
        ),
        pool.query(
          `SELECT
            ch.trait_name,
            cts.percentile_score,
            ch.hex_color,
            ch.category
          FROM character_trait_scores cts
          JOIN characteristics ch ON cts.trait_hex_color = ch.hex_color
          WHERE cts.character_hex_id = $1
          ORDER BY cts.percentile_score DESC
          LIMIT 15`,
          [characterId]
        ),
        pool.query(
          `SELECT
            cksm.domain_id,
            kd.domain_name,
            cksm.access_percentage,
            cksm.is_active
          FROM character_knowledge_slot_mappings cksm
          LEFT JOIN knowledge_domains kd ON cksm.domain_id = kd.domain_id
          WHERE cksm.character_id = $1
          AND cksm.is_active = true
          ORDER BY cksm.access_percentage DESC
          LIMIT 10`,
          [characterId]
        )
      ]);

      const inventory = inventoryResult.rows;
      const traits = traitsResult.rows;
      const knowledge = knowledgeResult.rows;

      const relatedInventory = inventory.filter(i =>
        String(i.object_name || "").toLowerCase().includes(String(entity).toLowerCase())
      );
      const relevantTraits = traits.filter(t =>
        String(t.trait_name || "").toLowerCase().includes(String(entity).toLowerCase())
      );
      const accessibleKnowledge = knowledge.filter(k =>
        String(k.domain_name || "").toLowerCase().includes(String(entity).toLowerCase())
      );

      return {
        entity,
        characterId,
        inventory,
        traits,
        knowledge,
        groundedReality: {
          hasInventoryMatch: relatedInventory.length > 0,
          hasTraitMatch: relevantTraits.length > 0,
          hasKnowledgeMatch: accessibleKnowledge.length > 0,
          relatedInventory,
          relevantTraits,
          accessibleKnowledge
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
        groundedReality: {
          hasInventoryMatch: false,
          hasTraitMatch: false,
          hasKnowledgeMatch: false,
          relatedInventory: [],
          relevantTraits: [],
          accessibleKnowledge: []
        },
        error: err.message
      };
    }
  }
}

export function generateGroundedStatement(groundedContext) {
  if (!groundedContext || !groundedContext.groundedReality) return "";

  const gr = groundedContext.groundedReality || {};
  const inventory = groundedContext.inventory || [];
  const traits = groundedContext.traits || [];
  const knowledge = groundedContext.knowledge || [];

  const invList = gr.relatedInventory && gr.relatedInventory.length
    ? gr.relatedInventory
    : inventory.slice(0, 2);

  if (invList && invList.length) {
    const names = invList.slice(0, 2).map(i => i.object_name).filter(Boolean);
    if (names.length) {
      return `I carry ${names.join(" and ")}.`;
    }
  }

  const knowList = gr.accessibleKnowledge && gr.accessibleKnowledge.length
    ? gr.accessibleKnowledge
    : knowledge.slice(0, 1);

  if (knowList && knowList.length) {
    const top = knowList[0];
    if (!top.domain_name) return "";

    if (top.access_percentage >= 80) {
      return `I've deeply studied ${top.domain_name}.`;
    }
    if (top.access_percentage >= 50) {
      return `I know something of ${top.domain_name}, though there are gaps.`;
    }
    return `I'm still learning about ${top.domain_name}.`;
  }

  const traitList = gr.relevantTraits && gr.relevantTraits.length
    ? gr.relevantTraits
    : traits.slice(0, 1);

  if (traitList && traitList.length) {
    const t = traitList[0];
    if (!t.trait_name) return "";

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
