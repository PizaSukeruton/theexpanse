// scripts/create-cotw-dossier-domain-and-import.js
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
    
    chosenSlot = await askQuestion("Enter your chosen slot hex (e.g. #000135): ");

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

    // Step 4: Create JSON with 25 starter items
    const jsonPath = path.resolve('cotw_dossier_knowledge.json');
    const starterItems = [
      {"topic":"cotw_dossier","subtopic":"purpose","type":"overview","difficulty":3,"tags":["system","claude","read-only"],"question":"What is the purpose of the COTW User Dossier?","answer":"It is a read-only internal layer that aggregates structural truth about a user, their dossier, linked character, traits, knowledge, inventory, relationship state, and narrative arcs. It exists so Claude can explain dossiers without mutating data.","source":"COTW Dossier Knowledge Base","is_canonical":true},
      {"topic":"cotw_dossier","subtopic":"architecture","type":"fact","difficulty":4,"tags":["data-flow","security"],"question":"How does the dossier architecture work?","answer":"User → Claude → Node.js API → read-only views → base tables. Claude never connects to DB, never runs SQL, never writes.","source":"COTW Dossier Knowledge Base","is_canonical":true},
      {"topic":"cotw_dossier","subtopic":"permissions","type":"security","difficulty":3,"tags":["access","app_role"],"question":"Who can read the dossier views?","answer":"Only app_role has SELECT (read-only). pizasukerutondb_user has full privileges for maintenance. No PUBLIC access.","source":"COTW Dossier Knowledge Base","is_canonical":true},
      {"topic":"cotw_dossier","subtopic":"core_identity","type":"fact","difficulty":2,"tags":["anchor","timestamps"],"question":"What does the core identity section contain?","answer":"Canonical mapping: dossier_id, user_id, character_id, user_created_at, dossier_created_at, dossier_updated_at. It is the anchor for every dossier query.","source":"cotw_core_identity_view","is_canonical":true},
      {"topic":"cotw_dossier","subtopic":"relationship_state","type":"overview","difficulty":4,"tags":["trust","perception","interaction"],"question":"What metrics are in the relationship state section?","answer":"trust_score, perceived_ability, perceived_benevolence, perceived_integrity, familiarity, shared_topics (jsonb), communication_style, interaction_count, last_interaction. All scores are 0.00–1.00.","source":"cotw_relationship_state_view","is_canonical":true},
      {"topic":"cotw_dossier","subtopic":"traits","type":"fact","difficulty":3,"tags":["personality","percentile"],"question":"What does the character traits section show?","answer":"Trait hex codes with percentile scores (0–100) indicating relative strength. Traits are enduring tendencies of the character, not the user.","source":"cotw_character_traits_view","is_canonical":true},
      {"topic":"cotw_dossier","subtopic":"knowledge","type":"overview","difficulty":5,"tags":["fsrs","mastery"],"question":"What is tracked in the knowledge state section?","answer":"Current expertise score, stability, difficulty, next_review_timestamp, is_mastered, is_forgotten — per knowledge item. No joins or FSRS internals exposed.","source":"cotw_knowledge_summary_view","is_canonical":true},
      {"topic":"cotw_dossier","subtopic":"inventory","type":"fact","difficulty":3,"tags":["items","acquisition"],"question":"What does the inventory section contain?","answer":"Current possessions: object_id, slot_trait_hex_id, acquired_at, source_character_id, acquisition_method, binding_type. Allows factual item references.","source":"cotw_inventory_state_view","is_canonical":true},
      {"topic":"cotw_dossier","subtopic":"narrative","type":"overview","difficulty":4,"tags":["arc","progress"],"question":"What is tracked in the narrative state section?","answer":"Arc_id, status (available/active/completed/abandoned), current_beat_id, completed_beat_ids, arc_state (jsonb), timestamps. Represents user position in story arcs.","source":"cotw_narrative_state_view","is_canonical":true},
      {"topic":"cotw_dossier","subtopic":"claude_rules","type":"rule","difficulty":3,"tags":["factuality","no-speculation"],"question":"What are Claude's strict rules when explaining dossiers?","answer":"Never hallucinate, invent, assume causality, generalize, predict, or contradict data. If missing: 'That information is not present in the dossier data I have.'","source":"Claude Dossier Explanation Prompt v007","is_canonical":true},
      {"topic":"cotw_dossier","subtopic":"no_custom_triggers","type":"fact","difficulty":2,"tags":["triggers","integrity"],"question":"Are there custom triggers on dossier base tables?","answer":"No — only PostgreSQL RI constraint triggers for FK enforcement. Updated_at is app-maintained, no hidden DB logic.","source":"Live trigger checks on relationship_state, cotw_dossiers, user_arc_state","is_canonical":true},
      {"topic":"cotw_dossier","subtopic":"permissions","type":"security","difficulty":3,"tags":["app_role","runtime"],"question":"What is the recommended runtime user for Node.js?","answer":"A restricted user that inherits app_role (SELECT only on views). Avoid connecting with pizasukerutondb_user (full privileges) in production.","source":"Permissions verification across all views","is_canonical":true},
      // ... Add more items here if you want >25; script will use whatever is in the array
    ];

    fs.writeFileSync(jsonPath, JSON.stringify(starterItems, null, 2));
    console.log(`Starter JSON with ${starterItems.length} items created at: ${jsonPath}`);
    console.log("Edit it to add more items from the guide.");

    await client.query('COMMIT');
    console.log("\n=== Success! ===");
    console.log(`Domain ID: ${domainId}`);
    console.log(`Mapping ID: ${mappingId}`);
    console.log(`Slot used: ${chosenSlot}`);
    console.log("\nNext steps:");
    console.log("1. Edit cotw_dossier_knowledge.json — add/expand items");
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
