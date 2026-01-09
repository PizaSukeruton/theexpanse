// scripts/create-cotw-dossier-domain.js
import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  const client = await pool.connect();
  let domainId, mappingId, chosenSlot;

  try {
    console.log("\n=== Step 1: Generate Domain ID (#AE range) ===");
    domainId = await generateHexId('domain_id');
    console.log(`Generated domain_id: ${domainId}`);

    await client.query('BEGIN');

    await client.query(`
      INSERT INTO knowledge_domains (domain_id, domain_name, description, parent_domain_id, is_active)
      VALUES ($1, $2, $3, NULL, true)
      ON CONFLICT (domain_id) DO NOTHING
    `, [
      domainId,
      'COTW Dossier System',
      'Complete technical documentation of the Council of the Wise (COTW) User Dossier subsystem: purpose, architecture, schema, Claude rules, permissions, data samples, triggers, and how Claude accesses and explains dossier data.'
    ]);
    console.log(`Domain created/confirmed: ${domainId}`);

    console.log("\n=== Step 2: Choose an unused slot (#00012C–#00015D) ===");
    console.log("Please run these in psql now (open another terminal):");
    console.log("1. SELECT hex_color, trait_name FROM characteristics WHERE hex_color BETWEEN '#00012C' AND '#00015D' ORDER BY hex_color;");
    console.log("2. SELECT slot_trait_hex_id FROM character_knowledge_slot_mappings WHERE character_id = '#700002';");
    console.log("Pick one hex_color from query 1 that is NOT in query 2 (unused by Claude).");
    
    chosenSlot = await askQuestion("Enter your chosen slot hex (e.g. #000140): ");

    if (!/^#[0-9A-Fa-f]{6}$/.test(chosenSlot)) {
      throw new Error("Invalid hex format. Must be #XXXXXX (uppercase letters OK)");
    }

    console.log(`Using slot: ${chosenSlot}`);

    console.log("\n=== Step 3: Generate Mapping ID (#AA range) ===");
    mappingId = await generateHexId('mapping_id');
    console.log(`Generated mapping_id: ${mappingId}`);

    await client.query(`
      INSERT INTO character_knowledge_slot_mappings (
        mapping_id, character_id, slot_trait_hex_id, domain_id, access_percentage, is_active
      ) VALUES ($1, $2, $3, $4, 100, true)
      ON CONFLICT (mapping_id) DO NOTHING
    `, [mappingId, '#700002', chosenSlot, domainId]);

    console.log(`Mapping created: ${mappingId}`);

    // Step 4: Create starter JSON file in project root
    const jsonPath = path.resolve('cotw_dossier_knowledge.json');
    const starterItems = [
      {
        topic: "cotw_dossier",
        subtopic: "purpose",
        type: "overview",
        difficulty: 3,
        tags: ["system", "claude", "read-only"],
        question: "What is the purpose of the COTW User Dossier?",
        answer: "It is a read-only internal layer that aggregates structural truth about a user, their dossier, linked character, traits, knowledge, inventory, relationship state, and narrative arcs. It exists so Claude can explain dossiers without mutating data.",
        source: "COTW Dossier Knowledge Base",
        is_canonical: true
      },
      {
        topic: "cotw_dossier",
        subtopic: "architecture",
        type: "fact",
        difficulty: 4,
        tags: ["data-flow", "security"],
        question: "How does the dossier architecture work?",
        answer: "User → Claude → Node.js API → read-only views → base tables. Claude never connects to DB, never runs SQL, never writes.",
        source: "COTW Dossier Knowledge Base",
        is_canonical: true
      },
      {
        topic: "cotw_dossier",
        subtopic: "permissions",
        type: "security",
        difficulty: 3,
        tags: ["access", "app_role"],
        question: "Who can read the dossier views?",
        answer: "Only app_role has SELECT (read-only). pizasukerutondb_user has full privileges for maintenance. No PUBLIC access.",
        source: "COTW Dossier Knowledge Base",
        is_canonical: true
      }
      // Add more items here or edit the file after running
    ];

    fs.writeFileSync(jsonPath, JSON.stringify(starterItems, null, 2));
    console.log(`Starter JSON created at: ${jsonPath} (edit to add all items)`);

    await client.query('COMMIT');
    console.log("\n=== Success! ===");
    console.log(`Domain ID: ${domainId}`);
    console.log(`Mapping ID: ${mappingId}`);
    console.log(`Slot used: ${chosenSlot}`);
    console.log("\nNext steps:");
    console.log("1. Edit cotw_dossier_knowledge.json — add 15–30 items from the guide");
    console.log("2. Create importer script (see previous response) with DOMAIN_ID = '${domainId}'");
    console.log("3. Run: node scripts/import_cotw_dossier_knowledge.js");

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error:', err.message);
  } finally {
    client.release();
    rl.close();
  }
}

main().catch(console.error);
