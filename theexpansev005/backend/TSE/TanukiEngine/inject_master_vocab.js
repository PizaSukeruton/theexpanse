import pool from '../../db/pool.js';

import fs from 'fs';

async function run() {
  console.log("📚 Loading Claude’s vocabulary…");

  const res = await pool.query(
    "SELECT vocabulary_json FROM learning_vocabulary WHERE character_id = '#700002'"
  );

  if (res.rows.length === 0) {
    console.error("❌ No vocabulary found. Run seed_brain.js first.");
    process.exit(1);
  }

  let brain = res.rows[0].vocabulary_json;

  // --- Ensure arrays exist ---
  brain.default_vocabulary = brain.default_vocabulary || [];
  brain.tanuki_mode_vocabulary = brain.tanuki_mode_vocabulary || [];
  brain.paradox_pairs = brain.paradox_pairs || [];
  brain.tanuki_mode_triggers = brain.tanuki_mode_triggers || [];
  brain.forbidden_words = brain.forbidden_words || [];

  // --- Load external vocab JSON packs ---
  const packs = JSON.parse(fs.readFileSync(
    "/Users/pizasukeruton/desktop/theexpanse/theexpansev005/backend/TSE/TanukiEngine/vocab_master_pack.json",
    "utf8"
  ));

  // Merge Default Vocab
  brain.default_vocabulary.push(...packs.default_vocabulary);

  // Merge Tanuki Mode Vocab
  brain.tanuki_mode_vocabulary.push(...packs.tanuki_mode_vocabulary);

  // Merge Paradox Pairs
  brain.paradox_pairs.push(...packs.paradox_pairs);

  // Merge Triggers
  brain.tanuki_mode_triggers.push(...packs.tanuki_mode_triggers);

  // Merge Forbidden Words (dedupe)
  brain.forbidden_words = Array.from(
    new Set([...brain.forbidden_words, ...packs.forbidden_words])
  );

  console.log("🔨 Merging final vocab into database…");

  await pool.query(
    "UPDATE learning_vocabulary SET vocabulary_json = $1 WHERE character_id = '#700002'",
    [JSON.stringify(brain)]
  );

  console.log("✅ Claude now knows ALL Tanuki wisdom packs.");
  process.exit();
}

run();
