import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const arcId = await generateHexId('narrative_arc_id');
    const beatId = await generateHexId('narrative_beat_id');

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
      'Test Arc: First Narrative Arc',
      'A simple test arc created by testCreateNarrativeArcAndBeat.js',
      'test_arc',
      {},
      {},
      100
    ]);

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
      beatId,
      arcId,
      'Test Beat: First Beat',
      'dialogue',
      {},
      {},
      { template: 'test_narrative_beat' },
      { pleasure: 0.0, arousal: 0.0, dominance: 0.0 },
      100,
      0,
      true,
      false
    ]);

    await client.query('COMMIT');

    console.log('Created narrative_arc and narrative_beat:');
    console.log('  arc_id:', arcId);
    console.log('  beat_id:', beatId);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating test narrative arc/beat:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('testCreateNarrativeArcAndBeat.js finished.');
}).catch(err => {
  console.error('Unexpected error in testCreateNarrativeArcAndBeat.js:', err.message);
  process.exitCode = 1;
});
