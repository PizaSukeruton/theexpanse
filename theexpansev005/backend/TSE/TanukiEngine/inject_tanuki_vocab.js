import pool from "../../db/pool.js";

async function run() {
  try {
    console.log("🔍 Fetching Claude's vocabulary…");

    const res = await pool.query(
      "SELECT vocabulary_json FROM learning_vocabulary WHERE character_id = $1 LIMIT 1",
      ['#700002']
    );

    if (res.rows.length === 0) {
      console.error("❌ No vocabulary found — run seed_brain.js first.");
      process.exit(1);
    }

    let brain = res.rows[0].vocabulary_json;

    // --- Ensure arrays exist ---
    brain.default_vocabulary = brain.default_vocabulary || [];
    brain.tanuki_mode_vocabulary = brain.tanuki_mode_vocabulary || [];
    brain.paradox_pairs = brain.paradox_pairs || [];
    brain.tanuki_mode_triggers = brain.tanuki_mode_triggers || [];

    // --- Example entries ---
    const extraDefaults = [
      {
        word: "chrome-halo",
        category: "tanuki_wit",
        definition: "When a flawed idea looks shiny because of presentation.",
        usage_example: "That UI mockup has a chrome-halo. Pretty, but hollow."
      }
    ];

    const extraTanuki = [
      {
        word: "shadow-step",
        category: "trickster_wisdom",
        definition: "Moving silently between arguments or ideas.",
        usage_example: "You just pulled a shadow-step between topics."
      }
    ];

    const extraPairs = [
      {
        word1: "loud",
        word2: "empty",
        connection: "Noise hides hollowness.",
        usage_example: "That claim is loud but empty."
      }
    ];

    const extraTriggers = ["chrome", "shadow", "noise", "empty"];

    // --- Merge ---
    brain.default_vocabulary.push(...extraDefaults);
    brain.tanuki_mode_vocabulary.push(...extraTanuki);
    brain.paradox_pairs.push(...extraPairs);
    brain.tanuki_mode_triggers.push(...extraTriggers);

    // --- Update DB ---
    await pool.query(
      "UPDATE learning_vocabulary SET vocabulary_json = $1 WHERE character_id = $2",
      [JSON.stringify(brain), '#700002']
    );

    console.log("✅ Injected vocabulary successfully.");
    process.exit(0);

  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

run();
