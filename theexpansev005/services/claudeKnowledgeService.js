import pool from '../backend/db/pool.js';

export async function getClaudeKnowledgeSummary(topic) {
  const search = `%${topic}%`;

  const { rows } = await pool.query(
    `
    SELECT domain_id, domain_name, description
    FROM knowledge_domains
    WHERE is_active = true
      AND (
        domain_name ILIKE $1
        OR description ILIKE $1
        OR EXISTS (
          SELECT 1
          FROM knowledge_items ki
          WHERE ki.domain_id = knowledge_domains.domain_id
            AND ki.content ILIKE $1
        )
      )
    ORDER BY domain_name ASC
    `,
    [search]
  );

  return {
    topic,
    matched_domains: rows.map((r) => ({
      id: r.domain_id,
      name: r.domain_name,
      short: r.description
    })),
    total_domains_available: rows.length
  };
}
