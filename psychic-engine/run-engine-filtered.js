import pool from '../backend/db/pool.js';
import PsychicEngine from './engine.js';

async function runEngine() {
  const engine = new PsychicEngine();
  
  try {
    // Get only actual narrative characters (exclude Knowledge Entity)
    const result = await pool.query(`
      SELECT character_id, character_name, category 
      FROM character_profiles 
      WHERE category != 'Knowledge Entity'
      ORDER BY character_id
    `);
    
    console.log('Processing narrative characters only:');
    
    // Process each one
    for (const row of result.rows) {
      console.log(`\nCharacter: ${row.character_name} (${row.category})`);
      await engine.processCharacter(row.character_id);
    }
    
    // Show what we saved
    const frames = await pool.query('SELECT * FROM psychic_frames');
    console.log(`\nTotal frames saved: ${frames.rows.length}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Engine error:', err);
    process.exit(1);
  }
}

runEngine();
