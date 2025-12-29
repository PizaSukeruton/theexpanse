import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

async function getWelcomeArcId(client) {
  const res = await client.query(
    `SELECT arc_id FROM narrative_arcs WHERE arc_type = 'onboarding_welcome' ORDER BY created_at DESC LIMIT 1`
  );
  if (res.rows.length === 0) {
    throw new Error('No onboarding_welcome arc found. Run createWelcomeArcFirstLogin.js first.');
  }
  return res.rows[0].arc_id;
}

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const arcId = await getWelcomeArcId(client);

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
      'Welcome Beat 1: Claude Greets',
      'dialogue',
      { requires_first_login: true },
      { set_flag: 'welcome_started' },
      {
        ltlm_dialogue_function: 'expressive.encourage',
        ltlm_speech_act: 'social.greet',
        ltlm_outcome_intent: 'relational_outcomes.build_trust',
        template_hint: 'welcome_first_login_1'
      },
      { pleasure: 0.6, arousal: 0.2, dominance: 0.0 },
      100,
      0,
      true,
      false
    ]);

    await client.query(insertBeatSql, [
      beatId2,
      arcId,
      'Welcome Beat 2: Explain Realm',
      'dialogue',
      { requires_flag: 'welcome_started' },
      { set_flag: 'welcome_completed' },
      {
        ltlm_dialogue_function: 'task_management.explain',
        ltlm_speech_act: 'directive.suggest',
        ltlm_outcome_intent: 'cognitive_outcomes.clarify_confusion',
        template_hint: 'welcome_first_login_2'
      },
      { pleasure: 0.5, arousal: 0.3, dominance: 0.1 },
      100,
      0,
      false,
      true
    ]);

    await client.query('COMMIT');

    console.log('Created Welcome Beats for arc_id:', arcId);
    console.log('  beat_id 1:', beatId1);
    console.log('  beat_id 2:', beatId2);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating Welcome Beats:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run().then(() => {
  console.log('createWelcomeBeatsFirstLogin.js finished.');
}).catch(err => {
  console.error('Unexpected error in createWelcomeBeatsFirstLogin.js:', err.message);
  process.exitCode = 1;
});
