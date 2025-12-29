import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const arcId = await generateHexId('narrative_arc_id');

    const sql = `
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

    await client.query(sql, [
      arcId,
      'Welcome Arc: First Login',
      'Claude the Tanuki welcomes the user the very first time they log on.',
      'onboarding_welcome',
      { first_login_only: true },
      { mark_arc_complete_after_beats: 2 },
      100
    ]);

    await client.query('COMMIT');
    console.log('Created Welcome Arc: First Login with arc_id:', arcId);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating Welcome Arc:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('createWelcomeArcFirstLogin.js finished.');
}).catch(err => {
  console.error('Unexpected error in createWelcomeArcFirstLogin.js:', err.message);
  process.exitCode = 1;
});
