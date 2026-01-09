// scripts/setup-cotw-dossier-domain.js
// Run from project root: node scripts/setup-cotw-dossier-domain.js

import pool from '../backend/db/pool.js';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function getNextId(idType) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const res = await client.query(
      'SELECT current_value FROM hex_id_counters WHERE id_type = $1 FOR UPDATE',
      [idType]
    );

    let nextValue;

    if (res.rows.length === 0) {
      const start = idType === 'domain_id' ? 0xAE0000 : 0xAA0000;
      nextValue = start;

      await client.query(
        'INSERT INTO hex_id_counters (id_type, current_value, last_used_id) VALUES ($1, $2, $3)',
        [idType, nextValue, `#${nextValue.toString(16).toUpperCase().padStart(6, '0')}`]
      );
    } else {
      nextValue = parseInt(res.rows[0].current_value, 10) + 1;

      await client.query(
        'UPDATE hex_id_counters SET current_value = $1, last_used_id = $2 WHERE id_type = $3',
        [nextValue, `#${nextValue.toString(16).toUpperCase().padStart(6, '0')}`, idType]
      );
    }

    await client.query('COMMIT');
    return `#${nextValue.toString(16).toUpperCase().padStart(6, '0')}`;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log("\n=== Step 1: Next domain_id (#AE...) ===");
    const domainId = await getNextId('domain_id');
    console.log(`Next domain_id: ${domainId}`);

    console.log("\n=== Step 2: Next mapping_id (#AA...) ===");
    const mappingId = await getNextId('mapping_id');
    console.log(`Next mapping_id: ${mappingId}`);

    console.log("\nPick a free knowledge slot hex.");
    const slot = await ask("Enter chosen slot hex (e.g. #000135): ");

    if (!/^#[0-9A-Fa-f]{6}$/.test(slot)) {
      throw new Error("Invalid slot hex format");
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO knowledge_domains
         (domain_id, domain_name, description, parent_domain_id, is_active)
         VALUES ($1, $2, $3, NULL, true)
         ON CONFLICT (domain_id) DO NOTHING`,
        [
          domainId,
          'COTW Dossier Full Belt Curriculum',
          'Comprehensive belt-level learning module for the COTW User Dossier'
        ]
      );

      await client.query(
        `INSERT INTO character_knowledge_slot_mappings
         (mapping_id, character_id, slot_trait_hex_id, domain_id, access_percentage, is_active)
         VALUES ($1, $2, $3, $4, 100, true)
         ON CONFLICT (mapping_id) DO NOTHING`,
        [mappingId, '#700002', slot, domainId]
      );

      await client.query('COMMIT');
      console.log("\nDomain & mapping inserted successfully.");
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    const jsonPath = path.resolve('cotw_dossier_knowledge.json');
    fs.writeFileSync(jsonPath, JSON.stringify([], null, 2));
    console.log(`Starter JSON created at ${jsonPath}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    rl.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
