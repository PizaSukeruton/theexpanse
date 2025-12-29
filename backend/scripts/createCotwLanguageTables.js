import pool from '../db/pool.js';

async function createTables() {
  const client = await pool.connect();
  
  try {
    console.log('[Schema] Creating COTW language tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS cotw_user_language (
        language_id VARCHAR(7) PRIMARY KEY,
        user_id VARCHAR(7) NOT NULL REFERENCES users(user_id),
        learned_phrase TEXT NOT NULL,
        base_concept VARCHAR(100),
        context TEXT,
        pad_coordinates JSONB,
        times_used INTEGER DEFAULT 0,
        times_successful INTEGER DEFAULT 0,
        avg_score DECIMAL(3,2),
        confidence_level INTEGER DEFAULT 0,
        date_learned TIMESTAMP DEFAULT NOW(),
        last_used TIMESTAMP,
        promoted_to_core BOOLEAN DEFAULT false,
        promotion_date TIMESTAMP
      )
    `);
    
    console.log('[Schema] ✓ cotw_user_language created');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS cotw_language_reports (
        report_id VARCHAR(7) PRIMARY KEY,
        user_id VARCHAR(7) NOT NULL REFERENCES users(user_id),
        report_data JSONB NOT NULL,
        status VARCHAR(20) DEFAULT 'pending_review',
        generated_at TIMESTAMP DEFAULT NOW(),
        reviewed_at TIMESTAMP,
        reviewed_by VARCHAR(7)
      )
    `);
    
    console.log('[Schema] ✓ cotw_language_reports created');
    
    await client.query(`
      ALTER TABLE ltlm_training_examples 
      ADD COLUMN IF NOT EXISTS usage_stats JSONB DEFAULT '{}'::jsonb
    `);
    
    console.log('[Schema] ✓ ltlm_training_examples.usage_stats added');
    
    console.log('[Schema] ✅ All COTW language tables ready');
    
  } catch (error) {
    console.error('[Schema] Error:', error);
    throw error;
  } finally {
    client.release();
  }
  
  await pool.end();
}

createTables();
