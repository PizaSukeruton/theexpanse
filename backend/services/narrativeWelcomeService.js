import pool from '../db/pool.js';
import { selectLtlmUtteranceForBeat } from './ltlmUtteranceSelector.js';

export async function getFirstLoginWelcomeBeat(userId, characterId) {
  const client = await pool.connect();
  try {
    const arcRes = await client.query(
      `
      SELECT arc_id
      FROM narrative_arcs
      WHERE arc_type = 'onboarding_welcome'
      ORDER BY created_at DESC
      LIMIT 1
      `
    );

    if (arcRes.rows.length === 0) {
      return null;
    }

    const arcId = arcRes.rows[0].arc_id;

    const stateRes = await client.query(
      `
      SELECT status
      FROM user_arc_state
      WHERE user_id = $1
        AND character_id = $2
        AND arc_id = $3
      `,
      [userId, characterId, arcId]
    );

    console.log("[WelcomeDebug v2] stateRes rows for", userId, characterId, arcId, ":", stateRes.rows);

    if (stateRes.rows.length > 0 && stateRes.rows[0].status !== 'available') {
      return null;
    }

    const beatRes = await client.query(
      `
      SELECT beat_id,
             title,
             content_template,
             target_pad
      FROM narrative_beats
      WHERE parent_arc_id = $1
        AND is_entry_beat = TRUE
      ORDER BY created_at ASC
      LIMIT 1
      `,
      [arcId]
    );

    if (beatRes.rows.length === 0) {
      return null;
    }

    const beat = beatRes.rows[0];

    const contentTemplate = beat.content_template || {};
    const targetPad = beat.target_pad || { pleasure: 0, arousal: 0, dominance: 0 };

    const ltlmSelection = await selectLtlmUtteranceForBeat({
      speakerCharacterId: '700002',
      speechActCode: contentTemplate.ltlm_speech_act || null,
      dialogueFunctionCode: contentTemplate.ltlm_dialogue_function || null,
      outcomeIntentCode: contentTemplate.ltlm_outcome_intent || null,
      targetPad
    });

    await client.query(
      `
      INSERT INTO user_arc_state (
        user_id,
        arc_id,
        character_id,
        status,
        current_beat_id
      )
      VALUES ($1, $2, $3, 'active', $4)
      ON CONFLICT (user_id, arc_id, character_id) DO UPDATE
        SET status = 'active',
            current_beat_id = EXCLUDED.current_beat_id,
            updated_at = NOW()
      `,
      [userId, arcId, characterId, beat.beat_id]
    );

    console.log("[WelcomeDebug] About to return welcome beat object");
    return {
      beatId: beat.beat_id,
      arcId,
      title: beat.title,
      contentTemplate,
      targetPad,
      ltlmUtterance: ltlmSelection
        ? {
            trainingExampleId: ltlmSelection.trainingExampleId,
            text: ltlmSelection.utteranceText,
            pad: ltlmSelection.pad
          }
        : null
    };
  } finally {
    client.release();
  }
}
