/**
 * PAD White Belt Setup Script
 * 
 * Creates the PAD domain and maps Claude to it using the hex ID generator.
 * Follows the exact pattern from TSE_Tanuki_System_Blueprint Section 4.
 * 
 * Usage:
 *   node --experimental-modules --no-warnings scripts/setup_pad_domain.js
 */

import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const client = await pool.connect();
try {
  await client.query('BEGIN');

  // Step 1: Generate domain ID using the hex generator
  const domainId = await generateHexId('domain_id');
  console.log(`Generated domain_id: ${domainId}`);

  // Step 2: Insert knowledge domain
  const domainSql = `
    INSERT INTO knowledge_domains (
      domain_id,
      domain_name,
      description,
      parent_domain_id,
      is_active
    ) VALUES ($1, $2, $3, NULL, true)
  `;

  await client.query(domainSql, [
    domainId,
    'PAD Emotional Foundations',
    'Foundational concepts of Pleasure, Arousal, and Dominance emotional dimensions for White Belt learning'
  ]);

  console.log(`Created domain: ${domainId}`);

  // Step 3: Generate mapping ID using the hex generator
  const mappingId = await generateHexId('mapping_id');
  console.log(`Generated mapping_id: ${mappingId}`);

  // Step 4: Insert character knowledge slot mapping (Claude gets 100% access)
  const mappingSql = `
    INSERT INTO character_knowledge_slot_mappings (
      mapping_id,
      character_id,
      slot_trait_hex_id,
      domain_id,
      access_percentage,
      is_active
    ) VALUES ($1, $2, $3, $4, 100, true)
  `;

  await client.query(mappingSql, [
    mappingId,
    '#700002',
    '#000142',
    domainId
  ]);

  console.log(`Created mapping: ${mappingId}`);

  // Commit transaction
  await client.query('COMMIT');
  
  console.log(`\n✓ Setup complete:`);
  console.log(`  Domain ID: ${domainId}`);
  console.log(`  Mapping ID: ${mappingId}`);
  console.log(`  Character: #700002 (Claude)`);
  console.log(`  Access: 100%`);

} catch (err) {
  await client.query('ROLLBACK');
  console.error(`Error: ${err.message}`);
  process.exit(1);
} finally {
  client.release();
}
