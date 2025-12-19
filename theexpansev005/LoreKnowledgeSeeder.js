import pool from "../db/pool.js";
import generateHexId from "../utils/hexIdGenerator.js";

export default class LoreKnowledgeSeeder {
  async seedCharacterLore() {
    try {
      const characters = await pool.query(`
        SELECT character_id, character_name, category, description
        FROM character_profiles
        WHERE category IN ('Protagonist', 'Antagonist', 'Tanuki', 'Council Of The Wise', 'Angry Slice Of Pizza', 'B-Roll Chaos', 'Knowledge Entity')
      `);

      const seeded = [];
      for (const char of characters.rows) {
        const knowledge_id = await generateHexId("knowledge_item_id");
        
        await pool.query(`
          INSERT INTO lore_knowledge_graph
          (knowledge_id, universe_id, knowledge_type, entity_name, description, canonical_facts, properties)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT DO NOTHING
        `, [
          knowledge_id,
          "#U00001",
          "character",
          char.character_name,
          char.description || "",
          JSON.stringify({
            character_id: char.character_id,
            category: char.category,
            core_fact: `${char.character_name} is a ${char.category}`
          }),
          JSON.stringify({
            character_id: char.character_id,
            category: char.category
          })
        ]);

        seeded.push({ knowledge_id, character_name: char.character_name, category: char.category });
      }

      console.log(`[LoreKnowledgeSeeder] Seeded ${seeded.length} character lore items`);
      return seeded;
    } catch (e) {
      console.error("[LoreKnowledgeSeeder] Error:", e.message);
      return [];
    }
  }

  async getLoreKnowledge(limit = 10) {
    try {
      const result = await pool.query(`
        SELECT knowledge_id, entity_name, description, canonical_facts
        FROM lore_knowledge_graph
        LIMIT $1
      `, [limit]);
      return result.rows;
    } catch (e) {
      console.error("[LoreKnowledgeSeeder] getLoreKnowledge error:", e.message);
      return [];
    }
  }
}
