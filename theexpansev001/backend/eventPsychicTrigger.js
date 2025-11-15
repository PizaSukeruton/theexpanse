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
      return { success: false, message: 'No event found' };
    }

    const event = eventResult.rows[0];
    const involvedCharacters = event.involved_characters || [];

    if (!Array.isArray(involvedCharacters) || involvedCharacters.length === 0) {
      return { success: false, message: 'No involved characters' };
    }

    // Batch fetch all emotional states at once
    const result = await pool.query(
      `
        SELECT character_id, emotional_state
        FROM psychic_frames
        WHERE character_id = ANY($1)
        AND timestamp = (
          SELECT max(timestamp)
          FROM psychic_frames pf2
          WHERE pf2.character_id = psychic_frames.character_id
        )
      `,
      [involvedCharacters]
    );

    // Create a lookup map for states
    const stateMap = {};
    for (const row of result.rows) {
      stateMap[row.character_id] = row.emotional_state;
    }

    const psychicEvents = [];

    for (const characterId of involvedCharacters) {
      const baseState = stateMap[characterId] || { p: 0, a: 0, d: 0 };
      const intensity = event.emotional_impact?.intensity || 0.5;
      const emotionalImpact = event.emotional_impact || { p: 0, a: 0, d: 0 };

      const newState = {
        p: Math.max(-1, Math.min(1, baseState.p + (emotionalImpact.p * intensity))),
        a: Math.max(-1, Math.min(1, baseState.a + (emotionalImpact.a * intensity))),
        d: Math.max(-1, Math.min(1, baseState.d + (emotionalImpact.d * intensity)))
      };

      psychicEvents.push({
        character_id: characterId,
        new_state: newState
      });
    }

    return {
      success: true,
      event_id: multiverseEventId,
      event_type: event.event_type,
      affected_characters: psychicEvents,
    };

  } catch (error) {
    throw error;
  }
}
