import fs from "fs";
import path from "path";
import pool from "../backend/db/pool.js";
import generateHexId from "../backend/utils/hexIdGenerator.js";

async function main() {
  const filePath = path.resolve("japanese_omiyage_knowledge_base_updated.json");
  const raw = fs.readFileSync(filePath, "utf8");
  const items = JSON.parse(raw);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const item of items) {
      const knowledgeId = await generateHexId("knowledge_item_id");

      const parts = [];
      if (item.question) parts.push(item.question);
      if (item.answer) parts.push(item.answer);
      if (item.cultural_context) parts.push(`Context: ${item.cultural_context}`);
      if (item.example) parts.push(`Example: ${item.example}`);
      if (item.comparisons) parts.push(`Comparisons: ${item.comparisons}`);
      if (item.warnings) parts.push(`Warnings: ${item.warnings}`);

      const content = parts.join("\n\n");
      const concept = `${item.subtopic || "omiyage"}_${item.type || "fact"}`.slice(0, 40);

      await client.query(
        `INSERT INTO knowledge_items (
           knowledge_id,
           content,
           semantic_embedding,
           domain_id,
           source_type,
           initial_character_id,
           initial_strength,
           complexity_score,
           concept
         )
         VALUES (
           $1,
           $2,
           NULL,
           $3,
           $4,
           $5,
           1.0,
           $6,
           $7
         )`,
        [
          knowledgeId,
          content,
          "#AE0006",
          "japanese_omiyage_knowledge_base_v1",
          "#700002",
          item.difficulty ? item.difficulty / 5.0 : 0.5,
          concept
        ]
      );
    }

    await client.query("COMMIT");
    console.log(`Imported ${items.length} omiyage knowledge items into domain #AE0006`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Import failed:", err.message);
  } finally {
    client.release();
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
});
