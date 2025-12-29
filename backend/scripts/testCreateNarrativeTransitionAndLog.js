import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

async function ensureTestArcAndBeats(client) {
  const arcRes = await client.query(
    `SELECT arc_id FROM narrative_arcs ORDER BY created_at ASC LIMIT 1`
  );

  let arcId;
  if (arcRes.rows.length > 0) {
    arcId = arcRes.rows[0].arc_id;
  } else {
    arcId = await generateHexId('narrative_arc_id');
    const insertArcSql = `
      INSERT INTO narrative_arcs (
        arc_id,
        title,
        description,
        arc_type,
        prerequisites,
        completion_logic,
        priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await client.query(insertArcSql, [
      arcId,
      'Test Arc: Auto-Created for Transition',
      'Auto-created arc for transition/log test',
      'test_arc',
      {},
      {},
      100
    ]);
  }

  const beatsRes = await client.query(
    `SELECT beat_id FROM narrative_beats WHERE parent_arc_id = $1 ORDER BY created_at ASC LIMIT 2`,
    [arcId]
  );

  if (beatsRes.rows.length === 2) {
    return { arcId, beatId1: beatsRes.rows[0].beat_id, beatId2: beatsRes.rows[1].beat_id };
  }

  const beatId1 = await generateHexId('narrative_beat_id');
  const beatId2 = await generateHexId('narrative_beat_id');

  const insertBeatSql = `
    INSERT INTO narrative_beats (
      beat_id,
      parent_arc_id,
      title,
      beat_type,
      preconditions,
      effects,
      content_template,
      target_pad,
      salience_weight,
      cooldown_minutes,
      is_entry_beat,
      is_terminal_beat
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `;

  await client.query(insertBeatSql, [
    beatId1,
    arcId,
    'Test Beat 1: For Transition',
    'dialogue',
    {},
    {},
    { template: 'test_narrative_beat_1' },
    { pleasure: 0.0, arousal: 0.0, dominance: 0.0 },
    100,
    0,
    true,
    false
  ]);

  await client.query(insertBeatSql, [
    beatId2,
    arcId,
    'Test Beat 2: For Transition',
    'dialogue',
    {},
    {},
    { template: 'test_narrative_beat_2' },
    { pleasure: 0.0, arousal: 0.0, dominance: 0.0 },
    100,
    0,
    false,
    false
  ]);

  return { arcId, beatId1, beatId2 };
}

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { arcId, beatId1, beatId2 } = await ensureTestArcAndBeats(client);

    const transitionId = await generateHexId('narrative_beat_transition_id');
    const logId = await generateHexId('narrative_beat_play_log_id');

    const insertTransitionSql = `
      INSERT INTO narrative_beat_transitions (
        transition_id,
        from_beat_id,
        to_beat_id,
        conditions,
        weight
      ) VALUES ($1, $2, $3, $4, $5)
    `;

    await client.query(insertTransitionSql, [
      transitionId,
      beatId1,
      beatId2,
      { note: 'test transition from beat 1 to beat 2' },
      100
    ]);

    const insertLogSql = `
      INSERT INTO narrative_beat_play_log (
        log_id,
        beat_id,
        user_id,
        character_id,
        session_id,
        pad_at_play,
        dossier_snapshot
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await client.query(insertLogSql, [
      logId,
      beatId1,
      '#D00001',
      '#700001',
      '#900000',
      { pleasure: 0.0, arousal: 0.0, dominance: 0.0 },
      { note: 'test snapshot' }
    ]);

    await client.query('COMMIT');

    console.log('Created narrative_beat_transition and narrative_beat_play_log:');
    console.log('  arc_id:', arcId);
    console.log('  from_beat_id:', beatId1);
    console.log('  to_beat_id:', beatId2);
    console.log('  transition_id:', transitionId);
    console.log('  log_id:', logId);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating test transition/log:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('testCreateNarrativeTransitionAndLog.js finished.');
}).catch(err => {
  console.error('Unexpected error in testCreateNarrativeTransitionAndLog.js:', err.message);
  process.exitCode = 1;
});
