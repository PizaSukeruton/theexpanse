import pool from '../backend/db/pool.js';
import { upsertMood } from "./mood-smoother.js"
import { spreadEmotion } from "./contagion.js"
import generateHexId from '../backend/utils/hexIdGenerator.js';

class PsychicEngine {
  async generateFrameId() {
    return await generateHexId('conversation_id');
  }

  async getCharacterTraits(characterId) {
    const result = await pool.query(
      'SELECT trait_hex_color, percentile_score FROM character_trait_scores WHERE character_hex_id = $1',
      [characterId]
    );
    return result.rows;
  }

  async calculateEmotionalState(characterId) {
    const traits = await this.getCharacterTraits(characterId);
    
    if (traits.length === 0) {
      console.log(`  No traits found for ${characterId}`);
      return null;
    }

    const avgScore = traits.reduce((sum, t) => sum + parseFloat(t.percentile_score), 0) / traits.length;
    
    const emotional_state = {
      p: (avgScore - 50) / 50,
      a: 0.5,
      d: (avgScore - 50) / 50
    };

    return emotional_state;
  }

  async saveFrame(characterId, emotionalState) {
    const frameId = await this.generateFrameId();
    
    await pool.query(
      'INSERT INTO psychic_frames (frame_id, character_id, emotional_state) VALUES ($1, $2, $3)',
      [frameId, characterId, JSON.stringify(emotionalState)]
    );
    
    await upsertMood({ characterId, p: emotionalState.p, a: emotionalState.a, d: emotionalState.d });
    await spreadEmotion(characterId, emotionalState);
    return frameId;
  }

  async processCharacter(characterId) {
    const emotionalState = await this.calculateEmotionalState(characterId);
    
    if (emotionalState) {
      const frameId = await this.saveFrame(characterId, emotionalState);
      console.log(`  Saved frame ${frameId} with state: { p: ${emotionalState.p.toFixed(3)}, a: ${emotionalState.a.toFixed(3)}, d: ${emotionalState.d.toFixed(3)} }`);
    }
  }
}

export default PsychicEngine;
