/**
 * Candidate Ranking - Smart heuristics for better search order
 * Agnostic: no hardcoded lists, just patterns
 */

export function rankCandidate(c) {
  const t = c.table.toLowerCase();
  const col = c.column.toLowerCase();
  let score = 0;

  // Column name heuristics
  if (/_id$/.test(col)) score += 30;
  if (/(^|_)hex/.test(col)) score += 15;
  if (/id$/.test(col)) score += 10;

  // Table name heuristics (generic)
  if (/character|profile/.test(t)) score += 10;
  if (/location|realm|place/.test(t)) score += 10;
  if (/knowledge|item|fact/.test(t)) score += 8;
  if (/event|session|log/.test(t)) score += 2;

  // Data type preference
  if (c.dataType === 'text' || c.dataType === 'character varying') {
    score += 10;
  }

  return score;
}

export default { rankCandidate };
