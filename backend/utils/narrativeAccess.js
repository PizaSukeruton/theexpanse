// backend/utils/narrativeAccess.js

import pool from '../db/pool.js'; // PostgreSQL connection pool
import generateAokHexId from './hexIdGenerator.js'; // Our AOK-specific hex ID generator
import { validateHexId  } from './hexUtils'; // Shared hex ID validator

// ---------- helpers ----------

/** normalize hex to uppercase #XXXXXX after validation */
function normalizeHexId(hex) {
  if (typeof hex !== 'string') return hex;
  const v = hex.trim();
  return v.startsWith('#') ? v.toUpperCase() : `#${v.toUpperCase()}`;
}

function assertHexId(id, fieldName = 'hex id') {
  if (!validateHexId(id)) {
    throw new Error(`Invalid ${fieldName} format. Expect "#RRGGBB".`);
  }
}

function isNonEmptyString(s) {
  return typeof s === 'string' && s.trim() !== '';
}

function isHttpUrl(s) {
  return typeof s === 'string' && /^(https?:)\/\//i.test(s.trim());
}

function toJsonb(value) {
  // always stringify to avoid driver-specific serialization edge cases
  return JSON.stringify(value ?? {});
}

async function existsQuery(sql, params) {
  const res = await pool.query(`${sql} LIMIT 1`, params);
  return res.rows.length > 0;
}

// ---------- existence checks (use normalized & validated ids) ----------

async function characterExists(characterId) {
  assertHexId(characterId, 'character_id');
  const id = normalizeHexId(characterId);
  // NOTE: adjust column name if your schema uses character_hex_id instead
  return existsQuery('SELECT 1 FROM character_profiles WHERE character_id = $1', [id]);
}

async function multimediaAssetExists(assetId) {
  assertHexId(assetId, 'asset_id');
  const id = normalizeHexId(assetId);
  return existsQuery('SELECT 1 FROM multimedia_assets WHERE asset_id = $1', [id]);
}

async function locationExists(locationId) {
  assertHexId(locationId, 'location_id');
  const id = normalizeHexId(locationId);
  return existsQuery('SELECT 1 FROM locations WHERE location_id = $1', [id]);
}

async function narrativeSegmentExists(segmentId) {
  assertHexId(segmentId, 'segment_id');
  const id = normalizeHexId(segmentId);
  return existsQuery('SELECT 1 FROM narrative_segments WHERE segment_id = $1', [id]);
}

// ---------- multimedia assets ----------

/**
 * Creates a new multimedia asset.
 * Expect columns:
 *  - asset_id TEXT (PK, hex)
 *  - asset_type TEXT CHECK IN ('video','image','audio')
 *  - url TEXT
 *  - description TEXT NULL
 *  - duration_seconds NUMERIC/INTEGER NULL
 *  - thumbnail_url TEXT NULL
 *  - tags TEXT[] NULL
 *  - created_at TIMESTAMPTZ DEFAULT now()
 */
async function createMultimediaAsset(assetData) {
  const {
    asset_type,
    url,
    description = null,
    duration_seconds = null,
    thumbnail_url = null,
    tags = [],
  } = assetData ?? {};

  if (!['video', 'image', 'audio'].includes(asset_type)) {
    throw new Error('Invalid or missing asset_type. Must be "video", "image", or "audio".');
  }
  if (!isHttpUrl(url)) {
    throw new Error('Asset URL must start with http:// or https://');
  }
  if (thumbnail_url !== null && !isHttpUrl(thumbnail_url)) {
    throw new Error('thumbnail_url must start with http:// or https:// (or be null)');
  }
  if (duration_seconds !== null) {
    if (typeof duration_seconds !== 'number' || duration_seconds < 0) {
      throw new Error('duration_seconds must be a non-negative number when provided.');
    }
  }
  if (!Array.isArray(tags) || !tags.every(t => typeof t === 'string')) {
    throw new Error('tags must be an array of strings.');
  }

  const asset_id = normalizeHexId(await generateAokHexId('multimedia_asset_id'));

  try {
    const result = await pool.query(
      `INSERT INTO multimedia_assets
         (asset_id, asset_type, url, description, duration_seconds, thumbnail_url, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [asset_id, asset_type, url.trim(), description, duration_seconds, thumbnail_url, tags]
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === '23505') {
      throw new Error('A multimedia asset with this asset_id or unique field already exists.');
    }
    throw err;
  }
}

async function getMultimediaAssetById(assetId) {
  assertHexId(assetId, 'asset_id');
  const id = normalizeHexId(assetId);
  const result = await pool.query('SELECT * FROM multimedia_assets WHERE asset_id = $1', [id]);
  return result.rows[0] ?? null;
}

async function listMultimediaAssets() {
  const result = await pool.query(
    'SELECT asset_id, asset_type, url, description, thumbnail_url FROM multimedia_assets ORDER BY created_at DESC'
  );
  return result.rows;
}

// ---------- locations ----------

/**
 * locations:
 *  - location_id TEXT (PK, hex)
 *  - name TEXT UNIQUE
 *  - description TEXT NULL
 *  - realm TEXT NULL
 *  - associated_asset_id TEXT NULL (FK -> multimedia_assets.asset_id)
 *  - created_at TIMESTAMPTZ DEFAULT now()
 */
async function createLocation(locationData) {
  const {
    name,
    description = null,
    realm = null,
    associated_asset_id = null,
  } = locationData ?? {};

  if (!isNonEmptyString(name)) {
    throw new Error('Location name is required.');
  }

  let assocAssetId = associated_asset_id;
  if (assocAssetId !== null && assocAssetId !== undefined) {
    assertHexId(assocAssetId, 'associated_asset_id');
    assocAssetId = normalizeHexId(assocAssetId);
    if (!(await multimediaAssetExists(assocAssetId))) {
      throw new Error(`Multimedia asset with ID ${assocAssetId} not found.`);
    }
  } else {
    assocAssetId = null;
  }

  const location_id = normalizeHexId(await generateAokHexId('location_id'));

  try {
    const result = await pool.query(
      `INSERT INTO locations (location_id, name, description, realm, associated_asset_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [location_id, name.trim(), description, realm, assocAssetId]
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === '23505') {
      // assumes UNIQUE(name)
      throw new Error(`Location with name "${name}" already exists.`);
    }
    throw err;
  }
}

async function getLocationById(locationId) {
  assertHexId(locationId, 'location_id');
  const id = normalizeHexId(locationId);
  const result = await pool.query('SELECT * FROM locations WHERE location_id = $1', [id]);
  return result.rows[0] ?? null;
}

async function listLocations() {
  const result = await pool.query(
    'SELECT location_id, name, description, realm FROM locations ORDER BY name'
  );
  return result.rows;
}

// ---------- narrative segments ----------

/**
 * narrative_segments:
 *  - segment_id TEXT (PK, hex)
 *  - title TEXT
 *  - content TEXT
 *  - summary TEXT NULL
 *  - keywords TEXT NULL  (comma-separated or free text)
 *  - segment_type TEXT CHECK IN (...)
 *  - associated_character_ids TEXT[] NULL
 *  - associated_location_id TEXT NULL (FK -> locations.location_id)
 *  - sentiment_tags JSONB NOT NULL DEFAULT '{}'
 *  - multimedia_asset_id TEXT NULL (FK -> multimedia_assets.asset_id)
 *  - created_at TIMESTAMPTZ DEFAULT now()
 */
async function createNarrativeSegment(segmentData) {
  const {
    title,
    content,
    summary = null,
    keywords = null,
    segment_type,
    associated_character_ids = [],
    associated_location_id = null,
    sentiment_tags = {},
    multimedia_asset_id = null,
  } = segmentData ?? {};

  if (!isNonEmptyString(title)) throw new Error('Narrative segment title is required.');
  if (!isNonEmptyString(content)) throw new Error('Narrative segment content is required.');

  const validSegmentTypes = ['narration', 'dialogue', 'choice_point', 'ending', 'character_intro_point'];
  if (!validSegmentTypes.includes(segment_type)) {
    throw new Error(`Invalid or missing segment_type. Must be one of: ${validSegmentTypes.join(', ')}.`);
  }

  if (!Array.isArray(associated_character_ids) || !associated_character_ids.every(id => validateHexId(id))) {
    throw new Error('associated_character_ids must be an array of valid hex IDs.');
  }
  // normalize + unique set (optional)
  const normalizedCharIds = [...new Set(associated_character_ids.map(normalizeHexId))];

  // existence checks in parallel
  await Promise.all(
    normalizedCharIds.map(async (charId) => {
      if (!(await characterExists(charId))) {
        throw new Error(`Associated character ID ${charId} not found.`);
      }
    })
  );

  let assocLocId = null;
  if (associated_location_id) {
    assertHexId(associated_location_id, 'associated_location_id');
    assocLocId = normalizeHexId(associated_location_id);
    if (!(await locationExists(assocLocId))) {
      throw new Error(`Associated location ID ${assocLocId} not found.`);
    }
  }

  let mediaId = null;
  if (multimedia_asset_id) {
    assertHexId(multimedia_asset_id, 'multimedia_asset_id');
    mediaId = normalizeHexId(multimedia_asset_id);
    if (!(await multimediaAssetExists(mediaId))) {
      throw new Error(`Multimedia asset ID ${mediaId} not found.`);
    }
  }

  if (typeof sentiment_tags !== 'object' || sentiment_tags === null) {
    throw new Error('sentiment_tags must be a valid JSON object.');
  }

  const segment_id = normalizeHexId(await generateAokHexId('narrative_segment_id'));

  try {
    const result = await pool.query(
      `INSERT INTO narrative_segments
         (segment_id, title, content, summary, keywords, segment_type,
          associated_character_ids, associated_location_id, sentiment_tags, multimedia_asset_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10)
       RETURNING *`,
      [
        segment_id,
        title.trim(),
        content,
        summary,
        keywords,
        segment_type,
        normalizedCharIds,     // TEXT[]
        assocLocId,
        toJsonb(sentiment_tags),
        mediaId,
      ]
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === '23505') {
      throw new Error('A narrative segment with this segment_id or unique field already exists.');
    }
    throw err;
  }
}

async function getNarrativeSegmentById(segmentId) {
  assertHexId(segmentId, 'segment_id');
  const id = normalizeHexId(segmentId);
  const result = await pool.query('SELECT * FROM narrative_segments WHERE segment_id = $1', [id]);
  return result.rows[0] ?? null;
}

async function listNarrativeSegments() {
  const result = await pool.query(
    'SELECT segment_id, title, segment_type, created_at FROM narrative_segments ORDER BY created_at DESC'
  );
  return result.rows;
}

// ---------- narrative paths ----------

/**
 * narrative_paths:
 *  - path_id TEXT (PK, hex)
 *  - source_segment_id TEXT (FK -> narrative_segments.segment_id)
 *  - target_segment_id TEXT (FK -> narrative_segments.segment_id)
 *  - path_type TEXT CHECK IN ('linear_progression','choice_option','conditional_branch')
 *  - choice_text TEXT NULL
 *  - conditions JSONB NOT NULL DEFAULT '{}'
 *  - consequences JSONB NOT NULL DEFAULT '{}'
 *  - order_in_choices INTEGER NULL
 *  - is_active BOOLEAN NOT NULL DEFAULT true
 *  - created_at TIMESTAMPTZ DEFAULT now()
 */
async function createNarrativePath(pathData) {
  const {
    source_segment_id,
    target_segment_id,
    path_type,
    choice_text: _choice_text = null,
    conditions: _conditions = {},
    consequences: _consequences = {},
    order_in_choices = null,
    is_active = true,
  } = pathData ?? {};

  assertHexId(source_segment_id, 'source_segment_id');
  assertHexId(target_segment_id, 'target_segment_id');

  const sourceId = normalizeHexId(source_segment_id);
  const targetId = normalizeHexId(target_segment_id);

  if (sourceId === targetId) {
    throw new Error('Source and target segment IDs cannot be the same (no self-loops).');
  }

  // verify both segments exist (in parallel)
  const [srcOk, tgtOk] = await Promise.all([
    narrativeSegmentExists(sourceId),
    narrativeSegmentExists(targetId),
  ]);
  if (!srcOk) throw new Error(`Source narrative segment ID ${sourceId} not found.`);
  if (!tgtOk) throw new Error(`Target narrative segment ID ${targetId} not found.`);

  const validPathTypes = ['linear_progression', 'choice_option', 'conditional_branch'];
  if (!validPathTypes.includes(path_type)) {
    throw new Error(`Invalid or missing path_type. Must be one of: ${validPathTypes.join(', ')}.`);
  }

  // use locals we can mutate safely
  let choice_text = _choice_text;
  let conditions = _conditions;
  let consequences = _consequences;

  if (path_type === 'choice_option') {
    if (!isNonEmptyString(choice_text)) {
      throw new Error('choice_text is required for path_type "choice_option".');
    }
    choice_text = choice_text.trim();
  } else {
    choice_text = null;
  }

  if (conditions == null || conditions === '') conditions = {};
  if (typeof conditions !== 'object') {
    throw new Error('conditions must be a valid JSON object.');
  }

  if (consequences == null || consequences === '') consequences = {};
  if (typeof consequences !== 'object') {
    throw new Error('consequences must be a valid JSON object.');
  }

  if (order_in_choices !== null) {
    if (typeof order_in_choices !== 'number' || order_in_choices < 0) {
      throw new Error('order_in_choices must be a non-negative number when provided.');
    }
  }

  const path_id = normalizeHexId(await generateAokHexId('narrative_path_id'));

  try {
    const result = await pool.query(
      `INSERT INTO narrative_paths
         (path_id, source_segment_id, target_segment_id, path_type,
          choice_text, conditions, consequences, order_in_choices, is_active)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8,$9)
       RETURNING *`,
      [
        path_id,
        sourceId,
        targetId,
        path_type,
        choice_text,
        toJsonb(conditions),
        toJsonb(consequences),
        order_in_choices,
        Boolean(is_active),
      ]
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === '23505') {
      throw new Error('A narrative path with this path_id or a unique key already exists.');
    }
    throw err;
  }
}

async function getNarrativePathById(pathId) {
  assertHexId(pathId, 'path_id');
  const id = normalizeHexId(pathId);
  const result = await pool.query('SELECT * FROM narrative_paths WHERE path_id = $1', [id]);
  return result.rows[0] ?? null;
}

async function listNarrativePaths() {
  const result = await pool.query(
    'SELECT path_id, source_segment_id, target_segment_id, path_type, choice_text FROM narrative_paths ORDER BY created_at DESC'
  );
  return result.rows;
}

export {
  // multimedia
  createMultimediaAsset,
  getMultimediaAssetById,
  listMultimediaAssets,
  // locations
  createLocation,
  getLocationById,
  listLocations,
  // segments
  createNarrativeSegment,
  getNarrativeSegmentById,
  listNarrativeSegments,
  // paths
  createNarrativePath,
  getNarrativePathById,
  listNarrativePaths,
};

