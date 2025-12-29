import pool from '../db/pool.js';

async function migratePADTrainingData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Starting PAD training data migration...');
    
    // ============================================================
    // STEP 1: Create new table with Grok's suggested improvements
    // ============================================================
    
    console.log('Creating pad_training_examples table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS pad_training_examples (
        training_example_id text PRIMARY KEY,
        utterance_text text NOT NULL UNIQUE,
        pad_pleasure real NOT NULL CHECK (pad_pleasure BETWEEN -1 AND 1),
        pad_arousal real NOT NULL CHECK (pad_arousal BETWEEN -1 AND 1),
        pad_dominance real NOT NULL CHECK (pad_dominance BETWEEN -1 AND 1),
        source text NOT NULL,
        tanuki_level integer DEFAULT 1 CHECK (tanuki_level BETWEEN 1 AND 5),
        appropriateness_score integer DEFAULT 1 CHECK (appropriateness_score BETWEEN -1 AND 1),
        created_by text NOT NULL,
        category_confidence numeric DEFAULT 1.0,
        tags text[] DEFAULT ARRAY['pad_training', 'user_emotion'],
        notes text,
        created_at timestamp DEFAULT NOW()
      )
    `);
    
    console.log('Table created.');
    
    // ============================================================
    // STEP 2: Add indexes for query performance
    // ============================================================
    
    console.log('Creating indexes...');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pad_training_source ON pad_training_examples(source)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pad_training_tags ON pad_training_examples USING GIN(tags)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pad_training_created_at ON pad_training_examples(created_at)
    `);
    
    console.log('Indexes created.');
    
    // ============================================================
    // STEP 3: Count records to migrate
    // ============================================================
    
    const countResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM ltlm_training_examples 
      WHERE source LIKE 'user_emotion_lexicon%'
    `);
    
    const recordCount = parseInt(countResult.rows[0].count);
    console.log(`Found ${recordCount} records to migrate.`);
    
    // ============================================================
    // STEP 4: Migrate data
    // ============================================================
    
    console.log('Migrating data...');
    
    const insertResult = await client.query(`
      INSERT INTO pad_training_examples (
        training_example_id,
        utterance_text,
        pad_pleasure,
        pad_arousal,
        pad_dominance,
        source,
        tanuki_level,
        appropriateness_score,
        created_by,
        category_confidence,
        tags,
        notes,
        created_at
      )
      SELECT 
        training_example_id,
        utterance_text,
        pad_pleasure,
        pad_arousal,
        pad_dominance,
        source,
        COALESCE(difficulty, 1) as tanuki_level,
        1 as appropriateness_score,
        COALESCE(created_by, 'migration'),
        COALESCE(category_confidence, 1.0),
        COALESCE(tags, ARRAY['pad_training', 'user_emotion']),
        notes,
        COALESCE(created_at, NOW())
      FROM ltlm_training_examples
      WHERE source LIKE 'user_emotion_lexicon%'
      ON CONFLICT (training_example_id) DO NOTHING
    `);
    
    console.log(`Inserted ${insertResult.rowCount} records into pad_training_examples.`);
    
    // ============================================================
    // STEP 5: Verify migration
    // ============================================================
    
    const verifyResult = await client.query(`
      SELECT COUNT(*) as count FROM pad_training_examples
    `);
    
    const newCount = parseInt(verifyResult.rows[0].count);
    console.log(`Verified: ${newCount} records now in pad_training_examples.`);
    
    if (newCount !== recordCount) {
      console.log(`WARNING: Count mismatch. Expected ${recordCount}, got ${newCount}.`);
      console.log('This may be due to duplicate utterance_text values (UNIQUE constraint).');
      
      // Check for duplicates that were skipped
      const dupCheck = await client.query(`
        SELECT utterance_text, COUNT(*) as cnt
        FROM ltlm_training_examples
        WHERE source LIKE 'user_emotion_lexicon%'
        GROUP BY utterance_text
        HAVING COUNT(*) > 1
        LIMIT 5
      `);
      
      if (dupCheck.rows.length > 0) {
        console.log('Sample duplicates found:');
        dupCheck.rows.forEach(r => console.log(`  "${r.utterance_text}" appears ${r.cnt} times`));
      }
    }
    
    // ============================================================
    // STEP 6: Delete from ltlm_training_examples
    // ============================================================
    
    console.log('Deleting migrated records from ltlm_training_examples...');
    
    const deleteResult = await client.query(`
      DELETE FROM ltlm_training_examples
      WHERE source LIKE 'user_emotion_lexicon%'
    `);
    
    console.log(`Deleted ${deleteResult.rowCount} records from ltlm_training_examples.`);
    
    // ============================================================
    // STEP 7: Also delete any orphaned outcome intent links
    // ============================================================
    
    console.log('Cleaning up orphaned outcome intent links...');
    
    const orphanResult = await client.query(`
      DELETE FROM ltlm_training_outcome_intents
      WHERE training_example_id NOT IN (
        SELECT training_example_id FROM ltlm_training_examples
      )
    `);
    
    console.log(`Deleted ${orphanResult.rowCount} orphaned outcome intent links.`);
    
    // ============================================================
    // STEP 8: Final verification
    // ============================================================
    
    const finalLtlmCount = await client.query(`
      SELECT COUNT(*) as count FROM ltlm_training_examples
    `);
    
    const finalPadCount = await client.query(`
      SELECT COUNT(*) as count FROM pad_training_examples
    `);
    
    await client.query('COMMIT');
    
    console.log('\n=== MIGRATION COMPLETE ===');
    console.log(`ltlm_training_examples: ${finalLtlmCount.rows[0].count} records`);
    console.log(`pad_training_examples: ${finalPadCount.rows[0].count} records`);
    console.log('\nNEXT STEP: Update PADEstimator.train() to query both tables.');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migratePADTrainingData();
