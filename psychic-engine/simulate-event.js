import pool from '../backend/db/pool.js';
import PsychicEngine from './engine.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

async function simulateEvent(characterId, eventType, intensity = 0.5) {
  const engine = new PsychicEngine();
  
  try {
    // Get current emotional state
    const current = await pool.query(
      'SELECT emotional_state FROM psychic_frames WHERE character_id = $1 ORDER BY timestamp DESC LIMIT 1',
      [characterId]
    );
    
    if (current.rows.length === 0) {
      console.log('No existing state for character');
      return;
    }
    
    const state = current.rows[0].emotional_state;
    console.log('Current state:', state);
    
    // Apply event impact based on type
    let newState = {...state};
    
    switch(eventType) {
      case 'trauma':
        newState.p -= intensity * 0.5;  // Reduce pleasure
        newState.a += intensity * 0.3;  // Increase arousal (stress)
        newState.d -= intensity * 0.4;  // Reduce dominance
        break;
      case 'joy':
        newState.p += intensity * 0.6;
        newState.a += intensity * 0.2;
        newState.d += intensity * 0.1;
        break;
      case 'threat':
        newState.p -= intensity * 0.3;
        newState.a += intensity * 0.5;  // High arousal
        newState.d -= intensity * 0.2;
        break;
      case 'victory':
        newState.p += intensity * 0.4;
        newState.a -= intensity * 0.1;  // Calming
        newState.d += intensity * 0.5;  // Increased dominance
        break;
    }
    
    // Clamp values between -1 and 1
    newState.p = Math.max(-1, Math.min(1, newState.p));
    newState.a = Math.max(-1, Math.min(1, newState.a));
    newState.d = Math.max(-1, Math.min(1, newState.d));
    
    // Save new frame
    const frameId = await engine.saveFrame(characterId, newState);
    
    // Log event
    const eventId = await generateHexId('psychic_event_id');
    await pool.query(
      'INSERT INTO psychic_events (event_id, frame_id, event_type, target_character, influence_data) VALUES ($1, $2, $3, $4, $5)',
      [eventId, frameId, eventType, characterId, JSON.stringify({intensity, impact: newState})]
    );
    
    console.log('New state after', eventType + ':', newState);
    console.log('Event', eventId, 'logged, frame', frameId, 'created');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

// Get command line args
const characterId = process.argv[2];
const eventType = process.argv[3];
const intensity = parseFloat(process.argv[4] || '0.5');

if (!characterId || !eventType) {
  console.log('Usage: node simulate-event.js <character_id> <event_type> [intensity]');
  console.log('Event types: trauma, joy, threat, victory');
  console.log('Intensity: 0-1 (default 0.5)');
  process.exit(1);
}

simulateEvent(characterId, eventType, intensity).then(() => process.exit(0));
