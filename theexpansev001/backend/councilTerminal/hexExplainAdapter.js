/**
 * Hex Explain Adapter
 * Normalizes explainHex output to guaranteed socket shape
 */

import { explainHex as coreExplainHex } from './explainHexHandler.js';

// Normalize to #XXXXXX uppercase
function normalizeHex(hexId) {
  if (typeof hexId !== 'string') return null;
  const m = hexId.trim().match(/^#?([0-9a-fA-F]{6})$/);
  return m ? `#${m[1].toUpperCase()}` : null;
}

// Case-insensitive field picker
function pickField(obj, candidates) {
  if (!obj || typeof obj !== 'object') return undefined;
  const keys = Object.keys(obj);
  for (const cand of candidates) {
    const k = keys.find(x => x.toLowerCase() === cand.toLowerCase());
    if (k) return obj[k];
  }
  return undefined;
}

// Try to extract a representative row from many possible shapes
function extractRow(r) {
  if (!r) return undefined;
  if (typeof r === 'string') return { basic_explanation: r };
  if (r.row && typeof r.row === 'object') return r.row;
  if (Array.isArray(r.rows) && r.rows.length) return r.rows[0];
  if (r.match && typeof r.match === 'object') return r.match;
  if (Array.isArray(r.matches) && r.matches.length) return r.matches[0];
  if (r.data && typeof r.data === 'object') return r.data;
  if (r.snapshot && typeof r.snapshot === 'object') return r.snapshot;
  return r; // last resort
}

// Safe, bounded stringify to avoid cycles/huge payloads
function safeStringify(obj, limit = 4000) {
  try {
    const s = JSON.stringify(obj, null, 2);
    return s.length > limit ? s.slice(0, limit) + '\n…(truncated)…' : s;
  } catch {
    return String(obj);
  }
}

export async function explainHexForSocket(hexId, mode = 'basic', opts = {}) {
  // IMPROVEMENT #1: Normalize hex input
  const HEX = normalizeHex(hexId);
  if (!HEX) {
    return {
      success: false,
      basic_explanation: 'Invalid hex format. Use #[0-9A-F]{6}.',
      expanded_explanation: undefined,
      where: undefined,
    };
  }

  // IMPROVEMENT #5: Wrap in try-catch for friendly error handling
  try {
    // IMPROVEMENT #6: Propagate mode parameter to core handler
    const r = await coreExplainHex(HEX, { returnMode: 'first', mode, ...(opts || {}) });

    // Detect various shapes and normalize
    const success = (
      r?.success ??
      r?.ok ??
      r?.found ??
      (!!r?.basic_explanation || !!r?.expanded_explanation || !!r?.match) ??
      (Array.isArray(r?.matches) && r.matches.length > 0)
    ) || false;

    // IMPROVEMENT #3: Extract row from multiple possible shapes
    const row = extractRow(r);

    // IMPROVEMENT #2: Better field extraction with case-insensitive matching
    // Expanded field candidates for character_profiles, locations, knowledge_items, etc.
    const name =
      pickField(r, [
        'basic_explanation', 'name', 'title', 'label', 'character_name',
        'location_name', 'location', 'concept', 'knowledge_title', 'realm'
      ]) ??
      pickField(row, [
        'basic_explanation', 'name', 'title', 'label', 'character_name',
        'location_name', 'location', 'concept', 'knowledge_title', 'realm'
      ]) ??
      pickField(row?.snapshot, ['name', 'title']);

    const desc =
      pickField(r, ['expanded_explanation', 'description', 'summary', 'details']) ??
      pickField(row, ['expanded_explanation', 'description', 'summary', 'details']) ??
      pickField(row?.snapshot, ['description', 'summary']);

    // Build basic explanation with improved field extraction
    const basic =
      r?.basic_explanation ??
      r?.match?.basic_explanation ??
      row?.basic_explanation ??
      (name && desc ? `${name} — ${desc}` : name) ??
      (success ? `${HEX} found` : `No data found for ${HEX}`);

    // IMPROVEMENT #4 + REFINEMENT: Use safe stringify, respecting mode parameter
    // Falls back to row if r.match is unavailable
    const expanded =
      r?.expanded_explanation ??
      r?.match?.expanded_explanation ??
      row?.expanded_explanation ??
      (mode === 'expanded'
        ? (r?.match ? safeStringify(r.match) : safeStringify(row))
        : undefined);

    // Broader where/source extraction including schema fields
    const where =
      r?.where ??
      r?.location ??
      r?.match?.where ??
      pickField(row, ['where', 'table', 'table_name', 'source', 'schema', 'schema_name', 'column', 'column_name']);

    // IMPROVEMENT #7: Optional debug logging (only if DEBUG_HEX=1)
    if (process.env.DEBUG_HEX === '1') {
      console.log('[HEX] ADAPTER OUT', { success, hasBasic: !!basic, hasExpanded: !!expanded, where, mode });
    }

    // REFINEMENT: Only include raw if DEBUG_HEX=1 to avoid large socket payloads
    return {
      success,
      basic_explanation: basic,
      expanded_explanation: expanded,
      where,
      ...(process.env.DEBUG_HEX === '1' ? { raw: r } : {})
    };
  } catch (err) {
    // IMPROVEMENT #5: Friendly error response instead of crashing
    console.error('[HEX] ADAPTER ERROR', err?.message || err);
    return {
      success: false,
      basic_explanation: `Failed to explain ${HEX}`,
      expanded_explanation: process.env.DEBUG_HEX === '1' ? String(err) : undefined,
      where: undefined,
    };
  }
}

export default { explainHexForSocket };
