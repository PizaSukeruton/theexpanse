import fs from "fs";
import path from "path";
import pool from "../backend/db/pool.js";
import generateHexId from "../backend/utils/hexIdGenerator.js";

const PHRASE_FILES = [
  "phrases_part1.json",
  "phrases_part2.json",
  "phrases_part3.json",
  "phrases_part4.json",
  "tanuki_phrase_library.json"
];

async function importPhrases() {
  const client = await pool.connect();
  let totalImported = 0;
  
  try {
    await client.query("BEGIN");
    
    for (const fileName of PHRASE_FILES) {
      const filePath = path.resolve(fileName);
      console.log(`\n[Import] Reading ${fileName}...`);
      
      const raw = fs.readFileSync(filePath, "utf8");
      let phrases = JSON.parse(raw);
      
      if (phrases && typeof phrases === "object" && !Array.isArray(phrases)) {
        phrases = phrases.phrases || [];
      }
      if (!Array.isArray(phrases)) {
        phrases = [phrases];
      }
      
      console.log(`[Import] Found ${phrases.length} phrases in ${fileName}`);
      
      for (const phrase of phrases) {
        const hexId = await generateHexId("learning_vocabulary_id");
        
        const insertQuery = `
          INSERT INTO conversational_phrases (
            phrase_hex_id,
            text,
            role,
            outcome_intent,
            strategy,
            tone,
            formality,
            language,
            tags,
            created_by,
            is_canonical
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;
        
        const values = [
          hexId,
          phrase.text,
          phrase.role,
          phrase.outcome_intent,
          phrase.strategy,
          phrase.tone,
          phrase.formality,
          phrase.language,
          JSON.stringify(phrase.tags || []),
          phrase.created_by || "EXT_HELPER_01",
          phrase.is_canonical !== false
        ];
        
        await client.query(insertQuery, values);
        totalImported++;
        
        if (totalImported % 100 === 0) {
          console.log(`[Progress] ${totalImported} phrases imported...`);
        }
      }
    }
    
    await client.query("COMMIT");
    console.log(`\n[Success] Imported ${totalImported} phrases total`);
    
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[Error]", err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

importPhrases().catch(console.error);
