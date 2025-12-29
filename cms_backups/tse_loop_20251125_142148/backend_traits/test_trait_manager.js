// backend/traits/test_trait_manager.js
// 🧪 TraitManager Test Harness

import getTraitVectorForCharacter from './TraitManager.js';
import pool from '../db/pool.js';

(async () => {
  const testCharacterId = '#700002'; // Replace with any valid character_id in your DB

  try {
    const result = await getTraitVectorForCharacter(testCharacterId, pool);
    console.log(`✅ Trait vector for ${testCharacterId}:`);
    console.dir(result, { depth: null });
  } catch (err) {
    console.error('❌ Error running TraitManager test:', err);
  } finally {
    await pool.end(); // Clean shutdown
  }
})();

