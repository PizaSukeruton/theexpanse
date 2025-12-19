import pool from '../backend/db/pool.js';

async function viewPsychicState() {
  try {
    console.log('\n=== PSYCHIC RADAR STATE ===\n');
    
    // Show all emotional frames
    const frames = await pool.query(`
      SELECT 
        pf.frame_id,
        pf.character_id,
        cp.character_name,
        pf.emotional_state,
        pf.timestamp
      FROM psychic_frames pf
      JOIN character_profiles cp ON pf.character_id = cp.character_id
      ORDER BY pf.timestamp
    `);
    
    console.log('EMOTIONAL STATES:');
    for (const frame of frames.rows) {
      const state = frame.emotional_state;
      console.log(`  ${frame.character_name} (${frame.character_id}):`);
      console.log(`    Pleasure: ${state.p.toFixed(2)}, Arousal: ${state.a.toFixed(2)}, Dominance: ${state.d.toFixed(2)}`);
      console.log(`    Frame: ${frame.frame_id} at ${frame.timestamp.toISOString()}\n`);
    }
    
    // Show proximity relationships
    const proximity = await pool.query(`
      SELECT 
        pp.*,
        cp1.character_name as char_a_name,
        cp2.character_name as char_b_name
      FROM psychic_proximity pp
      JOIN character_profiles cp1 ON pp.character_a = cp1.character_id
      JOIN character_profiles cp2 ON pp.character_b = cp2.character_id
    `);
    
    console.log('\nRELATIONSHIP PROXIMITY:');
    for (const rel of proximity.rows) {
      console.log(`  ${rel.char_a_name} <-> ${rel.char_b_name}:`);
      console.log(`    Distance: ${rel.psychological_distance.toFixed(3)}`);
      console.log(`    Resonance: ${rel.emotional_resonance.toFixed(3)}`);
      if (rel.relationship_type) {
        console.log(`    Type: ${rel.relationship_type}`);
      }
      console.log();
    }
    
    // Summary stats
    console.log('\nSUMMARY:');
    console.log(`  Total characters tracked: ${frames.rows.length}`);
    console.log(`  Total relationships: ${proximity.rows.length}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

viewPsychicState();
