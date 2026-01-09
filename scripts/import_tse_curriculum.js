#!/usr/bin/env node

/**
 * TSE Curriculum Knowledge Items Import Script
 * Reads tse_curriculum_knowledge_items_FINAL.json and inserts into knowledge_items table
 */

import fs from 'fs';
import path from 'path';
import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const DOMAIN_ID = '#AE0008';
const CHARACTER_ID = '#700002';
const JSON_FILE = './tse_curriculum_knowledge_items_FINAL.json';

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('TSE CURRICULUM IMPORT');
  console.log('═══════════════════════════════════════════\n');

  try {
    // Load JSON
    const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
    console.log(`✓ Loaded ${data.items.length} items\n`);

    let success = 0, failed = 0;

    // Insert each item
    for (const item of data.items) {
      try {
        const knowledgeId = await generateHexId('knowledge_item_id');
        const content = JSON.stringify(item);
        const complexity = {easy: 0.33, medium: 0.66, hard: 0.99}[item.complexity] || 0.5;

        await pool.query(
          `INSERT INTO knowledge_items 
            (knowledge_id, content, domain_id, source_type, initial_character_id, complexity_score, concept)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [knowledgeId, content, DOMAIN_ID, 'admin_entry', CHARACTER_ID, complexity, item.concept.substring(0, 40)]
        );

        success++;
        console.log(`✓ ${item.concept} → ${knowledgeId}`);
      } catch (err) {
        failed++;
        console.error(`✗ ${item.concept}: ${err.message}`);
      }
    }

    // Verify
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM knowledge_items WHERE domain_id = $1`,
      [DOMAIN_ID]
    );

    console.log(`\n═══════════════════════════════════════════`);
    console.log(`Inserted: ${success}/${data.items.length}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total in domain #AE0008: ${result.rows[0].count}`);
    console.log(`Status: ${failed === 0 ? '✓ SUCCESS' : '⚠ PARTIAL'}`);
    console.log('═══════════════════════════════════════════\n');

    process.exit(failed === 0 ? 0 : 1);
  } catch (err) {
    console.error(`✗ FATAL: ${err.message}`);
    process.exit(1);
  }
}

main();
