import pool from "../db/pool.js";
import generateHexId from "../utils/hexIdGenerator.js";

const dialogueFunctions = [
  { code: "task_management", name: "Task Management" },
  { code: "auto_feedback", name: "Auto Feedback" },
  { code: "allo_feedback", name: "Allo Feedback" },
  { code: "turn_management", name: "Turn Management" },
  { code: "time_management", name: "Time Management" },
  { code: "channel_management", name: "Channel Management" },
  { code: "own_communication_management", name: "Own Communication Management" },
  { code: "partner_communication_management", name: "Partner Communication Management" },
  { code: "topic_management", name: "Topic / Discourse Management" },
  { code: "social_obligations_management", name: "Social Obligations Management" }
];

const speechActs = [
  { code: "assertive", name: "Assertive" },
  { code: "expressive", name: "Expressive" },
  { code: "directive", name: "Directive" },
  { code: "commissive", name: "Commissive" },
  { code: "safe_refusal", name: "Safe Refusal" },
  { code: "feedback_elicitation", name: "Feedback Elicitation" },
  { code: "correction_solicitation", name: "Correction Solicitation" }
];

const narrativeFunctions = [
  { code: "structure_beats", name: "Structure Beats" },
  { code: "development_beats", name: "Development Beats" },
  { code: "continuity_functions", name: "Continuity Functions" },
  { code: "anchor_mechanics", name: "Anchor Mechanics" },
  { code: "atmospheric", name: "Atmospheric / Tanuki Logic" },
  { code: "meta_narrative", name: "Meta Narrative" }
];

const outcomes = [
  { code: "cognitive_outcomes", name: "Cognitive Outcomes" },
  { code: "emotional_outcomes", name: "Emotional Outcomes" },
  { code: "behavioral_outcomes", name: "Behavioral Outcomes" },
  { code: "relational_outcomes", name: "Relational Outcomes" }
];

async function insertCategory(table, idType, code, name) {
  const exists = await pool.query(
    `SELECT 1 FROM ${table} WHERE category_code = $1`,
    [code]
  );

  if (exists.rows.length > 0) {
    console.log(`SKIP: ${code} already exists`);
    return;
  }

  const hexId = await generateHexId(idType);

  await pool.query(
    `INSERT INTO ${table} (${idType}, category_code, name)
     VALUES ($1, $2, $3)`,
    [hexId, code, name]
  );

  console.log(`INSERTED: ${table} → ${hexId} (${code})`);
}

async function run() {
  try {
    console.log("Seeding Dialogue Functions...");
    for (const row of dialogueFunctions) {
      await insertCategory(
        "dialogue_function_categories",
        "dialogue_function_id",
        row.code,
        row.name
      );
    }

    console.log("Seeding Speech Acts...");
    for (const row of speechActs) {
      await insertCategory(
        "speech_act_categories",
        "speech_act_category_id",
        row.code,
        row.name
      );
    }

    console.log("Seeding Narrative Functions...");
    for (const row of narrativeFunctions) {
      await insertCategory(
        "narrative_function_categories",
        "narrative_function_id",
        row.code,
        row.name
      );
    }

    console.log("Seeding Outcome Intents...");
    for (const row of outcomes) {
      await insertCategory(
        "outcome_intent_categories",
        "outcome_intent_id",
        row.code,
        row.name
      );
    }

    console.log("DONE.");
    process.exit(0);
  } catch (err) {
    console.error("Seeder Error:", err);
    process.exit(1);
  }
}

run();
