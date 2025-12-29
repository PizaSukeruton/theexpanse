import generateHexId from '../backend/utils/hexIdGenerator.js';
import pool from '../backend/db/pool.js';

const CLAUDE_ID = '#700002';

// The four identity domains Claude needs (with UNUSED slots)
const domainsToGrant = [
  { slot: '#00012E', domain: '#C133B7', name: 'tanuki_mythology' },
  { slot: '#00012F', domain: '#00012C', name: 'story_basics' },
  { slot: '#000130', domain: '#AE0100', name: 'NLG Vocabulary - Tanuki' },
  { slot: '#000131', domain: '#AE0001', name: 'Conversational Acts' }
];

async function main() {
  const client = await pool.connect();
  try {
    for (const entry of domainsToGrant) {
      const mappingId = await generateHexId('mapping_id');
      
      await client.query(
        `INSERT INTO character_knowledge_slot_mappings
          (mapping_id, character_id, slot_trait_hex_id, domain_id, access_percentage, is_active)
         VALUES ($1, $2, $3, $4, 100, true)`,
        [mappingId, CLAUDE_ID, entry.slot, entry.domain]
      );
      
      console.log(`✅ Mapped ${entry.name} (${entry.domain}) to Claude via slot ${entry.slot} with mapping ${mappingId}`);
    }
    
    console.log('\n📊 Claude now has access to:');
    const result = await client.query(
      `SELECT ckm.domain_id, kd.domain_name, ckm.access_percentage
       FROM character_knowledge_slot_mappings ckm
       JOIN knowledge_domains kd ON ckm.domain_id = kd.domain_id
       WHERE ckm.character_id = $1
       ORDER BY kd.domain_name`,
      [CLAUDE_ID]
    );
    console.table(result.rows);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
