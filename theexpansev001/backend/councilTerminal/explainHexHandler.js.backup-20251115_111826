/**
 * Agnostic Hex Search Handler - PARALLEL OPTIMIZED
 * Ranks candidates and probes in parallel bands for speed
 */

import pool from '../db/pool.js';
import { rankCandidate } from './rankCandidate.js';

const HEX_REGEX = /^#[0-9A-F]{6}$/;
const DISCOVERY_TTL_MS = 5 * 60 * 1000;
const CONCURRENCY = 12;
const BAND_SIZE = 40;

const log = (...args) => console.log("[HEX]", new Date().toISOString(), ...args);

const qIdent = (name) => `"${String(name).replace(/"/g, '""')}"`;

let discoveryCache = { at: 0, candidates: [] };

/**
 * Create concurrency limiter
 */
function createLimiter(max) {
  let active = 0;
  const queue = [];
  const runNext = () => {
    if (active >= max || queue.length === 0) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    fn().then(resolve, reject).finally(() => {
      active--;
      runNext();
    });
  };
  return fn =>
    new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      runNext();
    });
}

/**
 * Discover all candidate columns - RANKED
 */
async function discoverHexColumns() {
  const now = Date.now();
  if (now - discoveryCache.at < DISCOVERY_TTL_MS && discoveryCache.candidates.length) {
    log(`discovery cache hit (${discoveryCache.candidates.length} candidates)`);
    return discoveryCache.candidates;
  }

  const client = await pool.connect();
  try {
    const sql = `
      SELECT c.table_schema, c.table_name, c.column_name, c.data_type
      FROM information_schema.columns c
      JOIN information_schema.tables t
        ON t.table_schema = c.table_schema
       AND t.table_name = c.table_name
      WHERE c.table_schema = 'public'
        AND t.table_type IN ('BASE TABLE','VIEW')
        AND c.data_type IN ('text','character varying','character','json','jsonb')
    `;
    const { rows } = await client.query(sql);

    const candidates = rows
      .map(r => ({
        schema: r.table_schema,
        table: r.table_name,
        column: r.column_name,
        dataType: r.data_type
      }))
      .map(c => ({ ...c, _rank: rankCandidate(c) }))
      .sort((a, b) => b._rank - a._rank);

    discoveryCache = { at: now, candidates };
    log(`discovery complete: ${candidates.length} candidates (ranked)`);
    return candidates;
  } finally {
    client.release();
  }
}

/**
 * Validate hex ID format
 */
function validateHexId(hexId) {
  if (typeof hexId !== 'string' || !HEX_REGEX.test(hexId)) {
    throw new Error(`Invalid hex ID: "${hexId}". Expected format #[0-9A-F]{6}.`);
  }
}

/**
 * Search single column for hex ID
 */
async function probeColumn(client, { schema, table, column, dataType }, hexId) {
  const t = `${qIdent(schema)}.${qIdent(table)}`;
  const col = qIdent(column);

  let sql, params;

  if (dataType === 'json' || dataType === 'jsonb') {
    sql = `SELECT * FROM ${t} WHERE ${col}::text LIKE $1 LIMIT 1`;
    params = [`%"${hexId}"%`];
  } else {
    sql = `SELECT * FROM ${t} WHERE ${col} = $1 LIMIT 1`;
    params = [hexId];
  }

  try {
    const res = await client.query(sql, params);
    if (res.rows && res.rows.length > 0) {
      log(`MATCH in ${schema}.${table}.${column}`);
      return {
        schema,
        table,
        column,
        dataType,
        matchedValue: hexId,
        sampleRow: res.rows[0]
      };
    }
  } catch (e) {
    log(`ERROR probing ${schema}.${table}.${column}: ${e.message}`);
    return { schema, table, column, dataType, error: e.message };
  }
  return null;
}

/**
 * Robust field extraction with case-insensitive fallback
 */
function pickField(row, candidates) {
  const lc = Object.fromEntries(Object.keys(row).map(k => [k.toLowerCase(), k]));
  for (const name of candidates) {
    const key = lc[name.toLowerCase()];
    if (key && row[key] != null && String(row[key]).trim() !== '') {
      return { key, value: row[key] };
    }
  }
  return null;
}

/**
 * Build agnostic explanation from raw data
 */
function buildAgnosticExplanation(schema, table, column, hexId, row) {
  const namePick = pickField(row, [
    'name', 'title', 'label', 'character_name', 'location_name', 'realm_name',
    'knowledge_title', 'display_name', 'wizard_name', 'entity_name', 'concept'
  ]);

  const descPick = pickField(row, [
    'description', 'summary', 'details', 'blurb', 'notes', 'body', 'about', 'content'
  ]);

  const basic = namePick
    ? String(namePick.value)
    : `${hexId} found in ${schema}.${table}.${column}`;

  const expanded = [
    namePick ? String(namePick.value) : '(no name)',
    descPick ? `— ${String(descPick.value).substring(0, 200)}` : '',
    `\n[Source: ${schema}.${table}.${column}]`
  ].filter(Boolean).join(' ');

  log(`Explanation built. Name found? ${!!namePick}, Desc found? ${!!descPick}`);

  return {
    success: true,
    where: { schema, table, column },
    hex: hexId,
    basic_explanation: basic,
    expanded_explanation: expanded
  };
}

/**
 * Probe a band of candidates in parallel
 */
async function probeBandParallel(client, band, hexId, concurrency) {
  const limiter = createLimiter(concurrency);
  let winner = null;

  const tasks = band.map(candidate =>
    limiter(async () => {
      if (winner) return null; // early exit if already found
      const result = await probeColumn(client, candidate, hexId);
      if (result && !result.error && result.sampleRow && !winner) {
        winner = result;
      }
      return null;
    })
  );

  await Promise.all(tasks);
  return winner;
}

/**
 * Main explain hex function - searches all tables with parallel bands
 */
export async function explainHex(hexId, userAccessLevel = 1) {
  try {
    validateHexId(hexId);
    
    const normalizedId = hexId.toUpperCase();
    log(`🦝 explainHex request for ${normalizedId}`);
    
    const candidates = await discoverHexColumns();
    log(`candidates=${candidates.length} (ranked)`);

    if (!candidates.length) {
      return {
        success: false,
        basic_explanation: 'No candidate columns discovered in database.',
        expanded_explanation: 'No candidate columns discovered in database.'
      };
    }

    const client = await pool.connect();
    try {
      // Search in bands with parallel probing
      let hit = null;
      for (let i = 0; i < candidates.length && !hit; i += BAND_SIZE) {
        const band = candidates.slice(i, i + BAND_SIZE);
        log(`probing band ${Math.floor(i / BAND_SIZE) + 1} (${band.length} candidates)`);
        hit = await probeBandParallel(client, band, normalizedId, CONCURRENCY);
      }

      if (!hit) {
        log(`NOT FOUND: ${normalizedId}`);
        return {
          success: false,
          basic_explanation: `Hex ID ${hexId} not found in system.`,
          expanded_explanation: `Hex ID ${hexId} not found in system. This ID may not have been created yet.`
        };
      }

      const explanation = buildAgnosticExplanation(
        hit.schema,
        hit.table,
        hit.column,
        normalizedId,
        hit.sampleRow
      );

      return explanation;

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error explaining hex:', error);
    return {
      success: false,
      basic_explanation: 'Error querying system database.',
      expanded_explanation: 'Error querying system database: ' + error.message
    };
  }
}

export default { explainHex };
