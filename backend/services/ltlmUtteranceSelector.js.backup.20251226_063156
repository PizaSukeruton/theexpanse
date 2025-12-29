import pool from '../db/pool.js';

export async function selectLtlmUtteranceForBeat({
  speakerCharacterId,
  speechActCode,
  dialogueFunctionCode,
  outcomeIntentCode,
  targetPad
}) {
  const client = await pool.connect();
  try {
    const { pleasure, arousal, dominance } = targetPad;

    const sql = `
      SELECT
        e.training_example_id,
        e.utterance_text,
        e.pad_pleasure,
        e.pad_arousal,
        e.pad_dominance
      FROM ltlm_training_examples e
      LEFT JOIN ltlm_training_outcome_intents oi
        ON oi.training_example_id = e.training_example_id
      WHERE
        e.speaker_character_id = $1
        AND e.speech_act_code = $2
        AND e.dialogue_function_code = $3
        AND ($4::text IS NULL OR oi.outcome_intent_code = $4)
      ORDER BY
        ((e.pad_pleasure - $5)::double precision * (e.pad_pleasure - $5)::double precision)
        + ((e.pad_arousal - $6)::double precision * (e.pad_arousal - $6)::double precision)
        + ((e.pad_dominance - $7)::double precision * (e.pad_dominance - $7)::double precision)
      LIMIT 10
    `;

    const params = [
      speakerCharacterId,
      speechActCode,
      dialogueFunctionCode,
      outcomeIntentCode || null,
      pleasure,
      arousal,
      dominance
    ];

    const result = await client.query(sql, params);

    if (result.rows.length === 0) {
      return null;
    }

    const rows = [...result.rows];
    for (let i = rows.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rows[i], rows[j]] = [rows[j], rows[i]];
    }

    const row = rows[0];

    return {
      trainingExampleId: row.training_example_id,
      utteranceText: row.utterance_text,
      pad: {
        pleasure: row.pad_pleasure,
        arousal: row.pad_arousal,
        dominance: row.pad_dominance
      }
    };
  } finally {
    client.release();
  }
}
