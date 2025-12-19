import fs from "fs";
import path from "path";
import pool from "../../db/pool.js";

async function run() {
  try {
    console.log("📚 Loading Claude’s Pack 2 vocabulary…");

    const filePath = path.resolve(
      "./backend/TSE/TanukiEngine/vocab_master_pack_2.json"
    );

    const raw = fs.readFileSync(filePath, "utf8");
    const pack = JSON.parse(raw);

    const fullQuery = `
      SELECT vocabulary_json
      FROM learning_vocabulary
      WHERE character_id = '#700002'
      LIMIT 1
    `;

    const res = await pool.query(fullQuery);

    if (res.rows.length === 0) {
      console.error("❌ Claude has no vocabulary entry. Run seed_brain first.");
      process.exit(1);
    }

    let brain = res.rows[0].vocabulary_json;

    const ensure = (field) => {
      if (!brain[field]) brain[field] = [];
    };

    ensure("default_vocabulary");
    ensure("tanuki_mode_vocabulary");
    ensure("paradox_pairs");
    ensure("tanuki_mode_triggers");

    const normalize = (str) => {
      if (!str || typeof str !== "string") return null;
      return str.toLowerCase().replace(/[^a-z0-9]+/g, "");
    };

    function mergeUnique(list, incoming) {
      const existing = new Set(
        list
          .map((i) => normalize(i.word))
          .filter((x) => x !== null)
      );

      for (const item of incoming || []) {
        const key = normalize(item.word);

        if (!key) {
          console.log("⚠ Skipping malformed item (no word):", item);
          continue;
        }

        if (!existing.has(key)) {
          list.push(item);
          existing.add(key);
        }
      }
    }

    mergeUnique(brain.tanuki_mode_vocabulary, pack.vocab || []);
    mergeUnique(brain.paradox_pairs, pack.pairs || []);

    const existingTriggers = new Set(brain.tanuki_mode_triggers || []);
    for (const trig of pack.triggers || []) {
      if (typeof trig === "string") existingTriggers.add(trig);
    }

    brain.tanuki_mode_triggers = Array.from(existingTriggers);

    const updateQuery = `
      UPDATE learning_vocabulary
      SET vocabulary_json = $1
      WHERE character_id = '#700002'
    `;

    await pool.query(updateQuery, [JSON.stringify(brain)]);

    console.log("✅ Claude has absorbed Pack 2 vocabulary.");
  } catch (err) {
    console.error("❌ Failed to inject vocabulary:", err);
  } finally {
    process.exit();
  }
}

run();
