import pool from '../../db/pool.js';
import generateHexId from '../../utils/hexIdGenerator.js';

const characterId = '#700002';

async function diagnoseInsert() {
  console.log('\n=== DIAGNOSTIC: Testing INSERT parameters ===\n');

  const usageId = await generateHexId('vocabulary_usage_id');
  console.log('Generated usageId:', usageId, 'type:', typeof usageId, 'length:', usageId.length);
  
  const vocabWord = 'gilded leaf';
  console.log('vocabWord:', vocabWord, 'type:', typeof vocabWord, 'length:', vocabWord.length);
  
  const category = 'tanuki-mode';
  const intent = 'playful';
  const level = 0.0;
  const safeTaskRef = null;
  
  console.log('\nAll parameters:');
  console.log('  [1] usageId:', JSON.stringify(usageId), 'len:', usageId.length);
  console.log('  [2] characterId:', JSON.stringify(characterId), 'len:', characterId.length);
  console.log('  [3] vocabWord:', JSON.stringify(vocabWord), 'len:', vocabWord.length);
  console.log('  [4] category:', JSON.stringify(category), 'len:', category.length);
  console.log('  [5] intent:', JSON.stringify(intent), 'len:', intent.length);
  console.log('  [6] level:', level, 'type:', typeof level);
  console.log('  [7] safeTaskRef:', safeTaskRef);
  
  const query = `
    INSERT INTO vocabularyusagelogs
      (usageid, characterid, vocabword, vocabcategory, detectedintent, tanukilevel, taskreference)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7)
  `;
  
  try {
    await pool.query(query, [
      usageId,
      characterId,
      vocabWord,
      category,
      intent,
      level,
      safeTaskRef
    ]);
    console.log('\n✅ INSERT succeeded');
  } catch (error) {
    console.log('\n❌ INSERT failed:', error.message);
  }
  
  process.exit(0);
}

diagnoseInsert();
