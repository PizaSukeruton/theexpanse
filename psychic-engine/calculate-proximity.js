import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

async function calculateProximity() {
  try {
    const frames = await pool.query(`
      SELECT frame_id, character_id, emotional_state 
      FROM psychic_frames
    `);
    
    console.log('Found frames for proximity calculation:', frames.rows.length);
    
    for (let i = 0; i < frames.rows.length; i++) {
      for (let j = i + 1; j < frames.rows.length; j++) {
        const char1 = frames.rows[i];
        const char2 = frames.rows[j];
        
        const state1 = char1.emotional_state;
        const state2 = char2.emotional_state;
        
        const distance = Math.sqrt(
          Math.pow(state1.p - state2.p, 2) +
          Math.pow(state1.a - state2.a, 2) + 
          Math.pow(state1.d - state2.d, 2)
        );
        
        const resonance = 1 / (1 + distance);
        
        const [charA, charB] = [char1.character_id, char2.character_id].sort();
        
        const proximityId = await generateHexId('domain_id');
        
        await pool.query(`
          INSERT INTO psychic_proximity 
          (proximity_id, character_a, character_b, psychological_distance, emotional_resonance)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (character_a, character_b) 
          DO UPDATE SET 
            psychological_distance = $4,
            emotional_resonance = $5,
            last_interaction = NOW()
        `, [proximityId, charA, charB, distance, resonance]);
        
        console.log(`Proximity between ${charA} and ${charB}: distance=${distance.toFixed(3)}, resonance=${resonance.toFixed(3)}`);
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

calculateProximity();
