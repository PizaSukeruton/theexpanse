import fs from 'fs';
import pool from '../../db/pool.js';

const packs = JSON.parse(
  fs.readFileSync(
    '/Users/pizasukeruton/desktop/theexpanse/theexpansev005/backend/TSE/TanukiEngine/vocab_master_pack_2.json',
    'utf8'
  )
);

function uniq(arr, keyFn) {
  const map = new Map();
  for (const item of arr) map.set(keyFn(item), item);
  return Array.from(map.values());
}

async function run() {
  try {
    console.log("📦 Loading Claude’s next vocabulary set…");

    const res = await pool.query(
      "SELECT vocabulary_json FROM learning_vocabulary WHERE character_id = '#700002'"
    );
    if (res.rows.length === 0) {
      console.log("❌ No Claude brain found.");
      process.exit(1);
    }

    let brain = res.rows[0].vocabulary_json;

    brain.tanuki_mode_vocabulary.push(...packs.vocab);
    brain.paradox_pairs.push(...packs.pairs);
    brain.tanuki_mode_triggers.push(...packs.triggers);

    brain.tanuki_mode_vocabulary = uniq(brain.tanuki_mode_vocabulary, x => x.word);
    brain.paradox_pairs = uniq(brain.paradox_pairs, x => x.word1 + '|' + x.word2);
    brain.tanuki_mode_triggers = Array.from(new Set(brain.tanuki_mode_triggers));

    await pool.query(
      "UPDATE learning_vocabulary SET vocabulary_json = $1 WHERE character_id = '#700002'",
      [JSON.stringify(brain)]
    );

    console.log("✅ Master Pack 2 injected successfully.");
  } catch (err) {
    console.error("❌ Failed:", err);
  } finally {
    process.exit();
  }
}

run();
