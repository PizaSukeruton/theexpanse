import pool from './db/pool.js';

function padToIntensity(pad){
  const p = pad?.p ?? 0, a = pad?.a ?? 0, d = pad?.d ?? 0;
  const mag = Math.sqrt(p*p + a*a + d*d) / Math.sqrt(3);
  return Math.max(0, Math.min(1, mag));
}

export function startPsychicRadar(wss, { intervalMs = 100, rmax = 10000 } = {}) {
  let lastRows = [];
  let lastFetchTs = 0;

  async function fetchLatestPAD(){
    const sql = `
      WITH latest_pad AS (
        SELECT
          pf.character_id,
          pf.emotional_state AS pad,
          pf."timestamp"      AS ts,
          ROW_NUMBER() OVER (PARTITION BY pf.character_id ORDER BY pf."timestamp" DESC) AS rn
        FROM psychic_frames pf
      )
      SELECT
        c.character_id,
        c.character_name,
        c.category,
        lp.pad,
        lp.ts
      FROM character_profiles c
      JOIN latest_pad lp
        ON lp.character_id = c.character_id AND lp.rn = 1
      WHERE c.category <> 'Knowledge Entity'
      ORDER BY c.character_id;
    `;
    const r = await pool.query(sql);
    return r.rows;
  }

  async function ensureFreshRows(){
    const now = Date.now();
    if (now - lastFetchTs > 250) {
      try {
        lastRows = await fetchLatestPAD();
        lastFetchTs = now;
      } catch (e) {
        // keep lastRows on transient DB error
      }
    }
    return lastRows;
  }

  function sweepBearing(){
    const periodMs = 5000; // ≈12 RPM
    return ((Date.now() % periodMs) / periodMs) * 360;
  }

  async function tick(){
    const rows = await ensureFreshRows();
    const payload = {
      type: 'contacts',
      sweep_bearing_deg: sweepBearing(),
      timestamp: new Date().toISOString(),
      contacts: rows.map(r => {
        const PAD = r.pad || { p: 0, a: 0, d: 0 };
        return {
          id: r.character_id,
          intensity: padToIntensity(PAD),
          class: r.category,
          meta: { character_name: r.character_name, PAD, Rmax_m: rmax }
        };
      })
    };
    const data = JSON.stringify(payload);
    wss.clients.forEach(c => { if (c.readyState === 1) c.send(data); });
  }

  const timer = setInterval(tick, intervalMs);

  wss.on('connection', (ws) => {
    ensureFreshRows().then(rows => {
      const payload = {
        type: 'contacts',
        sweep_bearing_deg: sweepBearing(),
        timestamp: new Date().toISOString(),
        contacts: rows.map(r => {
          const PAD = r.pad || { p:0,a:0,d:0 };
          return {
            id: r.character_id,
            intensity: padToIntensity(PAD),
            class: r.category,
            meta: { character_name: r.character_name, PAD, Rmax_m: rmax }
          };
        })
      };
      try { ws.send(JSON.stringify(payload)); } catch {}
    });
  });

  return () => clearInterval(timer);
}
