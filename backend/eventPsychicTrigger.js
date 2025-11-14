import pool from './db/pool.js';
import generateHexId from './utils/hexIdGenerator.js';
import PsychicEngine from '../psychic-engine/engine.js';

export async function triggerEventEmotionalImpact(multiverseEventId) {
  try {
    const eventResult = await pool.query(
      'SELECT * FROM multiverse_events WHERE event_id = $1',
      [multiverseEventId]
    );
    
    if (eventResult.rows.length === 0) {
      throw new Error(`Event ${multiverseEventId} not found`);
    }
    
    const event = eventResult.rows[0];
    const involvedCharacters = event.involved_characters || [];
    
    if (!Array.isArray(involvedCharacters) || involvedCharacters.length === 0) {
      console.log(`No characters involved in event ${multiverseEventId}`);
      return { success: false, message: 'No involved characters' };
    }
    
    const emotionalImpact = event.emotional_impact;
    
    if (!emotionalImpact || typeof emotionalImpact.p !== 'number') {
      console.log(`No emotional impact data in event ${multiverseEventId}`);
      return { success: false, message: 'No emotional impact data' };
    }
    
    const engine = new PsychicEngine();
    const psychicEvents = [];
    
    for (const characterId of involvedCharacters) {
      const currentState = await pool.query(
        'SELECT emotional_state FROM psychic_frames WHERE character_id = $1 ORDER BY timestamp DESC LIMIT 1',
        [characterId]
      );
      
      let baseState = { p: 0, a: 0, d: 0 };
      if (currentState.rows.length > 0) {
        baseState = currentState.rows[0].emotional_state;
      }
      
      const intensity = emotionalImpact.intensity || 0.5;
      
      const newState = {
        p: Math.max(-1, Math.min(1, baseState.p + (emotionalImpact.p * intensity))),
        a: Math.max(-1, Math.min(1, baseState.a + (emotionalImpact.a * intensity))),
        d: Math.max(-1, Math.min(1, baseState.d + (emotionalImpact.d * intensity)))
      };
      
      const frameId = await engine.saveFrame(characterId, newState);
      
      const psychicEventId = await generateHexId('psychic_event_id');
      await pool.query(
        `INSERT INTO psychic_events (event_id, frame_id, event_type, source_character, influence_data)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          psychicEventId,
          frameId,
          `event_${event.event_type}`,
          characterId,
          JSON.stringify({
            source_event_id: multiverseEventId,
            event_type: event.event_type,
            emotional_impact: emotionalImpact,
            location: event.location,
            realm: event.realm
          })
        ]
      );
      
      psychicEvents.push({
        character_id: characterId,
        psychic_event_id: psychicEventId,
        frame_id: frameId,
        new_state: newState
      });
      
      console.log(`Event impact: ${characterId} affected by ${event.event_type} (frame: ${frameId})`);
    }
    
    return {
      success: true,
      event_id: multiverseEventId,
      event_type: event.event_type,
      affected_characters: psychicEvents
    };
    
  } catch (error) {
    console.error('Error triggering event emotional impact:', error);
    throw error;
  }
}
