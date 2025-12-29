import cotwQueryEngine from "./cotwQueryEngine.js";
import { searchEntityAllTiers } from "../utils/tieredEntitySearch.js";
import pool from "../db/pool.js";

async function fetchTableConceptFromDB(tableName) {
  const query = `
    SELECT concept_id, concept_name, concept_type, concept_json
    FROM system_concepts
    WHERE concept_name = $1
  `;
  const result = await pool.query(query, [tableName]);
  
  if (result.rows.length === 0) {
    throw new Error(`No system_concept found for ${tableName}`);
  }

  return result.rows[0];
}

async function fetchAllCharacters() {
  const query = `
    SELECT character_id, character_name, category, is_active
    FROM character_profiles
    WHERE is_active = true
    ORDER BY character_name ASC
  `;
  const result = await pool.query(query);
  return result.rows;
}

export default async function GodModeDebugger(intent, user, command, session) {
  if (!user || user.access_level !== 11) {
    return null;
  }

  const lower = command.toLowerCase();
  if (!lower.startsWith("god mode:")) {
    return null;
  }

  const cleanCommand = command.replace(/god mode\s*:?\s*/i, "").trim();

  let debugLog = "";
  let finalEntityUsed = null;
  let finalEntityType = null;
  let finalImage = null;

  try {
    debugLog += "===== GOD MODE DEBUGGER =====\n";
    debugLog += `Original: ${command}\n`;
    debugLog += `Cleaned: ${cleanCommand}\n`;
    debugLog += `Intent Type: ${intent.type}\n`;
    debugLog += `Matcher Method: ${intent.matcherMethod}\n`;
    debugLog += `Entity: ${intent.entity}\n`;
    debugLog += `Confidence: ${intent.confidence}\n\n`;

    const schemaMatch = cleanCommand.match(/what\s+is\s+in\s+([a-zA-Z0-9_]+)\??/i)
      || cleanCommand.match(/show\s+schema\s+([a-zA-Z0-9_]+)\??/i)
      || cleanCommand.match(/describe\s+table\s+([a-zA-Z0-9_]+)\??/i);

    if (schemaMatch) {
      const tableName = schemaMatch[1];
      debugLog += "Detected schema question for table: " + tableName + "\n";

      try {
        const concept = await fetchTableConceptFromDB(tableName);
        const cj = concept.concept_json || {};
        const schema = cj.schema || {};
        const metadata = cj.metadata || {};
        const deps = cj.dependencies || {};
        const tableLevel = deps.table_level || {};
        const inbound = tableLevel.depended_on_by || [];

        const columns = schema.columns || [];
        const pk = schema.primary_key || [];
        const rowCount = metadata.row_count;
        const estimated = metadata.row_count_estimated;

        let summaryLines = [];

        summaryLines.push(`Table "${tableName}" is a database_table in schema "${metadata.table_schema}".`);
        summaryLines.push(`It has ${columns.length} columns and approximately ${rowCount} rows${estimated ? " (estimated)" : ""}.`);

        if (pk.length > 0) {
          summaryLines.push(`Primary key: ${pk.join(", ")}.`);
        }

        const importantCols = columns
          .filter(c => ["character_id", "id", "created_at", "updated_at", "category"].includes(c.name))
          .map(c => `${c.name} (${c.type}${c.nullable ? ", nullable" : ", not null"})`);

        if (importantCols.length > 0) {
          summaryLines.push("Key columns: " + importantCols.join("; ") + ".");
        }

        if (inbound.length > 0) {
          const byTable = {};
          inbound.forEach(fk => {
            if (!byTable[fk.table]) byTable[fk.table] = [];
            byTable[fk.table].push(fk.their_column);
          });
          const inboundSummaries = Object.entries(byTable)
            .slice(0, 10)
            .map(([t, cols]) => `${t} (${Array.from(new Set(cols)).join(", ")})`);
          summaryLines.push(`Other tables depending on this table (${inbound.length} FKs, showing up to 10): ${inboundSummaries.join("; ")}.`);
        }

        const output = summaryLines.join(" ");

        return {
          mode: "god",
          output,
          debugLog,
          entityUsed: tableName,
          entityType: "database_table",
          queryType: "schema_inspect",
          image: null,
          concept
        };
      } catch (schemaErr) {
        debugLog += "Schema branch error: " + schemaErr.message + "\n";
      }
    }

    const characterListMatch = cleanCommand.match(/list\s+(all\s+)?characters\??/i)
      || cleanCommand.match(/show\s+(all\s+)?characters\??/i)
      || cleanCommand.match(/all\s+characters\??/i);

    if (characterListMatch) {
      debugLog += "Detected character list question\n";

      try {
        const characters = await fetchAllCharacters();
        debugLog += `Found ${characters.length} active characters\n`;

        let summaryLines = [];
        summaryLines.push(`Found ${characters.length} active characters in the Expanse.`);

        if (characters.length > 0) {
          const charList = characters
            .slice(0, 15)
            .map(c => `${c.character_name} (${c.character_id}, ${c.category})`)
            .join("; ");

          summaryLines.push(`Showing first 15: ${charList}${characters.length > 15 ? "..." : ""}`);
        }

        const output = summaryLines.join(" ");

        return {
          mode: "god",
          output,
          debugLog,
          entityUsed: "all_characters",
          entityType: "character_list",
          queryType: "character_list",
          image: null,
          characterCount: characters.length,
          characters
        };
      } catch (charErr) {
        debugLog += "Character list branch error: " + charErr.message + "\n";
      }
    }

    const realm = intent.realm;
    debugLog += `Realm: ${realm}\n\n`;

    debugLog += "===== TIERED SEARCH =====\n";

    const tierData = await searchEntityAllTiers(
      intent.entity || cleanCommand,
      realm
    );

    debugLog += `Query: ${tierData.query}\n`;
    debugLog += `Latency: ${tierData.total_latency_ms}ms\n\n`;

    const tiers = [
      { label: "TIER 1 (Exact)", data: tierData.tier1 },
      { label: "TIER 2 (Phonetic)", data: tierData.tier2 },
      { label: "TIER 3 (Fuzzy)", data: tierData.tier3 }
    ];

    for (const t of tiers) {
      debugLog += `--- ${t.label} ---\n`;
      if (t.data && t.data.count > 0) {
        debugLog += `Count: ${t.data.count}\nMethod: ${t.data.method}\n`;
        for (const m of t.data.matches) {
          debugLog += `- ${m.entity_name} (${m.entity_type}) [${m.entity_id}]\n`;
        }
      } else {
        debugLog += "No matches.\n";
      }
      debugLog += "\n";
    }

    debugLog += "===== USER-FACING RESULT =====\n";

    const best =
      tierData.tier1?.matches?.[0] ||
      tierData.tier2?.matches?.[0] ||
      tierData.tier3?.matches?.[0] ||
      null;

    if (!best) {
      return {
        mode: "god",
        output: `No matches found for "${intent.entity}".`,
        debugLog
      };
    }

    const userIntent = {
      type: intent.type,
      entity: best.entity_name,
      entityData: best,
      realm,
      original: command
    };

    const userResult = await cotwQueryEngine.executeQuery(userIntent, user);

    finalEntityUsed = best.entity_name;
    finalEntityType = best.entity_type;

    let cleanOutput = userResult.message || "(no summary)";
    finalImage = userResult.data?.image_url || userResult.image || null;

    return {
      mode: "god",
      output: cleanOutput,
      debugLog,
      entityUsed: finalEntityUsed,
      entityType: finalEntityType,
      queryType: intent.type,
      image: finalImage
    };
  } catch (err) {
    return {
      mode: "god",
      output: "God Mode failed to process.",
      error: err.message,
      debugLog
    };
  }
}
