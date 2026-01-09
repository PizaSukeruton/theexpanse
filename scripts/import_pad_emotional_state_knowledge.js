/**
 * PAD White Belt Knowledge Base Import Script
 * 
 * Imports 9 PAD foundational concepts into knowledge_items
 * Uses the hex generator for knowledge_item_id
 * 
 * Usage:
 *   node --experimental-modules --no-warnings scripts/import_pad_emotional_state_knowledge.js
 */

import fs from 'fs';
import path from 'path';
import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const DOMAIN_ID = '#AE0007';
const INITIAL_CHARACTER_ID = '#700002';
const SOURCE_TYPE = 'admin_entry';

const client = await pool.connect();
try {
  await client.query('BEGIN');

  const filePath = path.resolve('pad_emotional_state_knowledge_base.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const items = JSON.parse(raw);

  let imported = 0;

  for (const item of items) {
    const knowledgeId = await generateHexId('knowledge_item_id');

    const parts = [];
    if (item.question) parts.push(item.question);
    if (item.answer) parts.push(item.answer);
    if (item.cultural_context) parts.push(`Context: ${item.cultural_context}`);
    if (item.example) parts.push(`Example: ${item.example}`);
    if (item.comparisons) parts.push(`Comparisons: ${item.comparisons}`);
    if (item.warnings) parts.push(`Warnings: ${item.warnings}`);

    const content = parts.join('\n\n');
    const concept = `${item.subtopic || 'concept'}_${item.type || 'fact'}`.slice(0, 40);
    const complexityScore = item.difficulty ? item.difficulty / 5.0 : 0.5;

    await client.query(
      `INSERT INTO knowledge_items (
        knowledge_id, content, semantic_embedding, domain_id, source_type,
        initial_character_id, initial_strength, complexity_score, concept
      ) VALUES ($1, $2, NULL, $3, $4, $5, 1.0, $6, $7)`,
      [knowledgeId, content, DOMAIN_ID, SOURCE_TYPE, INITIAL_CHARACTER_ID, complexityScore, concept]
    );

    imported++;
    console.log(`  [${imported}] ${knowledgeId} - ${concept}`);
  }

  await client.query('COMMIT');
  console.log(`\n✓ Imported ${imported} items`);

} catch (err) {
  await client.query('ROLLBACK');
  console.error(`Error: ${err.message}`);
  process.exit(1);
} finally {
  client.release();
}
