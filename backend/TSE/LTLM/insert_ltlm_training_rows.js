import pool from "../../db/pool.js";
import generateHexId from "../../utils/hexIdGenerator.js";

/*
  LTLM Training Row Ingestion (Batch Safe)
  - Max 25 inserts per run
  - Sequential only
  - Abort on first failure
*/

async function insertTrainingRow({
  candidateText,
  category,
  speakerCharacterId = "#700002", // Claude the Tanuki (Narrator)
  aboutCharacterId = null,
  padPleasure = 0.0,
  padArousal = 0.0,
  padDominance = 0.0,
  tanukiLevel = null,
  hasReality = false,
  hasRelationships = false,
  hasEvents = false,
  appropriatenessScore,
  source,
  createdBy,
  labelingNotes
}) {
  const trainingId = await generateHexId("ltlm_training_example_id");

  const query = `
    INSERT INTO training_insertion_data (
      training_id,
      candidate_text,
      category,
      speaker_character_id,
      about_character_id,
      pad_pleasure,
      pad_arousal,
      pad_dominance,
      tanuki_level,
      has_reality,
      has_relationships,
      has_events,
      appropriateness_score,
      source,
      created_by,
      labeling_notes
    ) VALUES (
      $1,$2,$3,$4,$5,
      $6,$7,$8,$9,
      $10,$11,$12,
      $13,$14,$15,$16
    )
  `;

  await pool.query(query, [
    trainingId,
    candidateText,
    category,
    speakerCharacterId,
    aboutCharacterId,
    padPleasure,
    padArousal,
    padDominance,
    tanukiLevel,
    hasReality,
    hasRelationships,
    hasEvents,
    appropriatenessScore,
    source,
    createdBy,
    labelingNotes
  ]);

  console.log(`✅ Inserted training row ${trainingId}`);
}

async function run() {
  const rows = [
    "<SUBJECT> seems a little quieter right now — it might be better to wait before engaging.",
    "<SUBJECT> appears less responsive at the moment — giving some space could help.",
    "<SUBJECT> comes across as more reserved right now — it may be worth pausing.",
    "<SUBJECT> seems slower to engage at the moment — waiting could be wise.",
    "<SUBJECT> appears harder to reach right now — it might help to check back later.",
    "<SUBJECT> comes across as slightly withdrawn — this may not be the best time.",
    "<SUBJECT> seems to be conserving energy — allowing some space could help.",
    "<SUBJECT> appears less available at the moment — waiting may be better.",
    "<SUBJECT> seems quieter than usual — a pause could be beneficial.",
    "<SUBJECT> comes across as more inward-focused right now — patience may help.",
    "<SUBJECT> appears less engaged currently — it might be better to wait.",
    "<SUBJECT> seems a bit distant at the moment — giving room could help.",
    "<SUBJECT> comes across as needing space right now — pausing may be best.",
    "<SUBJECT> appears subdued at the moment — waiting could be useful.",
    "<SUBJECT> seems less open right now — it may help to hold off.",
    "<SUBJECT> comes across as slower to respond — patience may be wise.",
    "<SUBJECT> appears less communicative at the moment — giving time could help.",
    "<SUBJECT> seems inwardly focused right now — waiting could be better.",
    "<SUBJECT> comes across as less available — a pause may help.",
    "<SUBJECT> appears to need some breathing room — waiting could be beneficial.",
    "<SUBJECT> seems quieter in this moment — it may be best to pause.",
    "<SUBJECT> comes across as slightly closed off — patience may help.",
    "<SUBJECT> appears less present right now — giving space could work.",
    "<SUBJECT> seems to be disengaging slightly — waiting might be best.",
    "<SUBJECT> comes across as low on responsiveness — pausing could help."
  ];

  if (rows.length !== 25) {
    throw new Error("Safety check failed: row count must be exactly 25.");
  }

  try {
    for (let i = 0; i < rows.length; i++) {
      await insertTrainingRow({
        candidateText: rows[i],
        category: "#005219", // SOCIAL_STATE_RELAY
        padPleasure: -0.2,
        padArousal: -0.1,
        padDominance: -0.6,
        tanukiLevel: 0.3,
        hasReality: false,
        hasRelationships: false,
        hasEvents: false,
        appropriatenessScore: 1.0,
        source: "human_annotation",
        createdBy: "manual_voice_anchor",
        labelingNotes: "Identity-agnostic low-dominance social timing language"
      });
    }
  } catch (err) {
    console.error("❌ Batch insert failed. Aborting.", err);
  } finally {
    await pool.end();
  }
}

run();
