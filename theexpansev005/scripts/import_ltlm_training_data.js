import fs from "fs";
import path from "path";
import pool from "../backend/db/pool.js";
import generateHexId from "../backend/utils/hexIdGenerator.js";

const SPEAKER_CHARACTER_ID = "#700002";
const SOURCE = "ltlm_v3_tanuki_batch";
const CREATED_BY = "batch_import";

async function main() {
  const filePath = path.resolve("ltlm_training_data.txt");
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split("\n").filter(line => line.trim() !== "");

  const client = await pool.connect();
  let imported = 0;
  let outcomeIntentsCreated = 0;

  try {
    await client.query("BEGIN");

    for (const line of lines) {
      const parts = line.split(" | ");
      
      if (parts.length !== 8) {
        console.warn(`Skipping malformed line (${parts.length} fields): ${line.slice(0, 50)}...`);
        continue;
      }

      const [
        utterance_text,
        dialogue_function_code,
        speech_act_code,
        narrative_function_code_raw,
        outcome_intent_codes_raw,
        pad_pleasure,
        pad_arousal,
        pad_dominance
      ] = parts.map(p => p.trim());

      const narrative_function_code = narrative_function_code_raw === "NULL" ? null : narrative_function_code_raw;
      const outcome_intent_codes = outcome_intent_codes_raw === "NULL" ? [] : outcome_intent_codes_raw.split(",").map(c => c.trim());

      const training_example_id = await generateHexId("ltlm_training_example_id");

      await client.query(
        `INSERT INTO ltlm_training_examples (
          training_example_id,
          speaker_character_id,
          utterance_text,
          dialogue_function_code,
          speech_act_code,
          narrative_function_code,
          pad_pleasure,
          pad_arousal,
          pad_dominance,
          emotion_register_id,
          source,
          is_canonical,
          difficulty,
          tags,
          category_confidence,
          notes,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          training_example_id,
          SPEAKER_CHARACTER_ID,
          utterance_text,
          dialogue_function_code,
          speech_act_code,
          narrative_function_code,
          parseFloat(pad_pleasure),
          parseFloat(pad_arousal),
          parseFloat(pad_dominance),
          null,
          SOURCE,
          true,
          1,
          [],
          1.0,
          null,
          CREATED_BY
        ]
      );

      imported++;

      for (const outcome_code of outcome_intent_codes) {
        if (outcome_code) {
          const ltlm_outcome_intent_id = await generateHexId("ltlm_outcome_intent_id");
          
          await client.query(
            `INSERT INTO ltlm_training_outcome_intents (
              ltlm_outcome_intent_id,
              training_example_id,
              outcome_intent_code
            ) VALUES ($1, $2, $3)`,
            [ltlm_outcome_intent_id, training_example_id, outcome_code]
          );
          
          outcomeIntentsCreated++;
        }
      }
    }

    await client.query("COMMIT");
    console.log(`✓ Imported ${imported} training examples`);
    console.log(`✓ Created ${outcomeIntentsCreated} outcome intent mappings`);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Import failed:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
