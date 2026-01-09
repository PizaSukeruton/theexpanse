import pool from "../../db/pool.js";

export async function getClaudeFullState(characterId = "#700002") {
  const query = `
    SELECT
      cp.character_id,
      cp.character_name,
      cp.category,
      json_agg(DISTINCT jsonb_build_object('trait', ch.trait_name, 'score', cts.percentile_score)) AS traits,
      json_agg(DISTINCT jsonb_build_object('object', o.object_name, 'method', ci.acquisition_method)) AS inventory,
      json_agg(DISTINCT jsonb_build_object('domain', kd.domain_name, 'access', cksm.access_percentage)) AS knowledge
    FROM character_profiles cp
    LEFT JOIN character_trait_scores cts ON cp.character_id = cts.character_hex_id
    LEFT JOIN characteristics ch ON cts.trait_hex_color = ch.hex_color
    LEFT JOIN character_inventory ci ON cp.character_id = ci.character_id
    LEFT JOIN objects o ON ci.object_id = o.object_id
    LEFT JOIN character_knowledge_slot_mappings cksm ON cp.character_id = cksm.character_id
    LEFT JOIN knowledge_domains kd ON cksm.domain_id = kd.domain_id
    WHERE cp.character_id = $1
    GROUP BY cp.character_id
  `;
  const result = await pool.query(query, [characterId]);
  return result.rows[0] || null;
}
