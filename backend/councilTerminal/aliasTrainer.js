import pool from "../db/pool.js";

/**
 * aliasTrainer.js
 * Learns from user confirmations and ambiguous queries.
 * Stores aliases in the database and updates confidence.
 */

async function processIfApplicable(session, cleanedCommand, response) {
  try {
    // Only operate on disambiguation-type responses (confirm, clarify, refine)
    const isTrainable =
      response &&
      ["confirm", "clarify", "disambiguate"].includes(response.action);

    if (!isTrainable) {
      return null;
    }

    const mainEntity = response.data?.entity_name;
    const userPhrase = cleanedCommand?.toLowerCase();

    if (!mainEntity || !userPhrase) {
      return null;
    }

    // Check existing alias, if any
    const existing = await pool.query(
      "SELECT * FROM entity_aliases WHERE lower(alias_text) = lower($1)",
      [userPhrase]
    );

    if (existing.rows.length > 0) {
      // Already known -> increment confidence
      await pool.query(
        "UPDATE entity_aliases SET confidence = confidence + 1 WHERE lower(alias_text) = lower($1)",
        [userPhrase]
      );

      return {
        learned: false,
        updated: true,
        alias: userPhrase,
        entity: mainEntity
      };
    }

    // Create a new alias entry
    const insertSql = `
      INSERT INTO entity_aliases (alias_text, target_entity_name, created_by, confidence)
      VALUES ($1, $2, $3, $4)
    `;

    await pool.query(insertSql, [
      userPhrase,
      mainEntity,
      session.username,
      1
    ]);

    return {
      learned: true,
      alias: userPhrase,
      entity: mainEntity
    };

  } catch (err) {
    console.error("[AliasTrainer] Error:", err);
    return null;
  }
}

export default {
  processIfApplicable
};
