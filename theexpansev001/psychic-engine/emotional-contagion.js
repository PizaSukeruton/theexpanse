import pool from '../backend/db/pool.js';
import PsychicEngine from './engine.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

class EmotionalContagion {
  constructor() {
    this.engine = new PsychicEngine();
    this.contagionStrength = 0.3;
    this.decayFactor = 0.5;
    this.threshold = 0.05; // Lowered threshold
  }

  async propagateEmotion(sourceCharacterId, eventType, intensity) {
    const relationships = await pool.query(
      'SELECT * FROM psychic_proximity WHERE character_a = $1 OR character_b = $1',
      [sourceCharacterId]
    );

    console.log(`Found ${relationships.rows.length} relationships for ${sourceCharacterId}`);

    for (const rel of relationships.rows) {
      const targetId = rel.character_a === sourceCharacterId ? rel.character_b : rel.character_a;
      
      // Skip self-relationships
      if (targetId === sourceCharacterId) {
        console.log(`  Skipping self-relationship`);
        continue;
      }
      
      const resonance = parseFloat(rel.emotional_resonance);
      const contagionIntensity = intensity * resonance * this.contagionStrength * this.decayFactor;
      
      console.log(`  ${sourceCharacterId} -> ${targetId}: intensity=${contagionIntensity.toFixed(3)} (threshold=${this.threshold})`);
      
      if (contagionIntensity > this.threshold) {
        console.log(`    Applying contagion!`);
        await this.applySympatheticResponse(targetId, eventType, contagionIntensity);
      }
    }
  }

  async applySympatheticResponse(characterId, eventType, intensity) {
    const current = await pool.query(
      'SELECT emotional_state FROM psychic_frames WHERE character_id = $1 ORDER BY timestamp DESC LIMIT 1',
      [characterId]
    );
    
    if (current.rows.length === 0) return;
    
    const state = current.rows[0].emotional_state;
    let newState = {...state};
    
    switch(eventType) {
      case 'trauma':
        newState.p -= intensity * 0.2;
        newState.a += intensity * 0.2;
        break;
      case 'threat':
        newState.a += intensity * 0.3;
        break;
      case 'joy':
        newState.p += intensity * 0.3;
        break;
    }
    
    newState.p = Math.max(-1, Math.min(1, newState.p));
    newState.a = Math.max(-1, Math.min(1, newState.a));
    newState.d = Math.max(-1, Math.min(1, newState.d));
    
    const frameId = await this.engine.saveFrame(characterId, newState);
    console.log(`    Created frame ${frameId} for ${characterId}`);
    
    const eventId = await generateHexId('psychic_event_id');
    await pool.query(
      'INSERT INTO psychic_events (event_id, frame_id, event_type, target_character, influence_data) VALUES ($1, $2, $3, $4, $5)',
      [eventId, frameId, 'contagion_' + eventType, characterId, JSON.stringify({intensity, source_emotion: eventType})]
    );
  }
}

export default EmotionalContagion;
