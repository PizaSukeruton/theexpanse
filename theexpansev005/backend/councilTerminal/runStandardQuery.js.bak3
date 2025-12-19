import cotwQueryEngine from "./cotwQueryEngine.js";
import knowledgeAccess from "../utils/knowledgeAccess.js";
import knowledgeQueryLayer from "../services/knowledgeQueryLayer.js";

const CLAUDE_CHARACTER_ID = "#700002";

export default async function runStandardQuery(intentResult, session, cleanCommand) {
  const nested = intentResult.entityData || {};

  const resolvedType =
    intentResult.entityType ||
    nested.entity_type ||
    null;

  const resolvedId =
    intentResult.entityId ||
    nested.entity_id ||
    null;

  const resolvedName =
    intentResult.entity ||
    nested.entity_name ||
    null;

  const enginePayload = {
    queryType: intentResult.type,
    ...intentResult,
    entityType: resolvedType,
    entityId: resolvedId,
    entity: resolvedName
  };

  console.log(
    `[DEBUG] runStandardQuery → ${enginePayload.queryType} | Entity: '${enginePayload.entity}' | Type: ${enginePayload.entityType} | ID: ${enginePayload.entityId}`
  );

  const queryType = enginePayload.queryType || "";
  console.log("[DEBUG] About to check knowledge-first guard. queryType=", queryType, "includes WHAT/HOW/WHEN?", ["WHAT", "HOW", "WHEN"].includes(queryType.toUpperCase()), "entity=", enginePayload.entity);

  // STEP 2 CHANGE #1: Extended knowledge guard to include follow-up question types
  const isInitialQuery = ["WHAT", "HOW", "WHEN"].includes(queryType.toUpperCase());
  const isFollowUpQuery = ["SEARCH", "WHY", "EXPLAIN"].includes(queryType.toUpperCase());
  const shouldQueryKnowledge = (isInitialQuery || isFollowUpQuery) && enginePayload.entity;

  if (shouldQueryKnowledge) {
    console.log("[DEBUG] ENTERING knowledge-first block");
    
    // STEP 2 CHANGE #2: Recover context for follow-up questions
    let contextDomains = [];
    if (isFollowUpQuery && session?.context?.lastEntity) {
      console.log(`[DEBUG] Follow-up detected. Last entity: ${session.context.lastEntity}`);
      // Get domains from last query
      if (session.context.lastDomains && Array.isArray(session.context.lastDomains)) {
        contextDomains = session.context.lastDomains;
        console.log(`[DEBUG] Recovered domains from context: ${contextDomains.join(", ")}`);
      }
    }
    
    try {
      const knowledgeResult = await knowledgeQueryLayer.queryClaudeKnowledge(
        enginePayload.entity,
        queryType,
        CLAUDE_CHARACTER_ID,
        contextDomains  // STEP 2 CHANGE #2: Pass context domains to knowledge layer
      );

      console.log("[DEBUG] Knowledge result:", knowledgeResult);

      if (knowledgeResult && knowledgeResult.found && knowledgeResult.items.length > 0) {
        const primary = knowledgeResult.items[0];
        const content = primary.content || "";

        const firstNewline = content.indexOf("\n");
        let answerBlock = content;
        if (firstNewline !== -1) {
          answerBlock = content.substring(firstNewline + 1);
        }

        const doubleNewline = answerBlock.indexOf("\n\n");
        let basicExplanation = answerBlock;
        if (doubleNewline !== -1) {
          basicExplanation = answerBlock.substring(0, doubleNewline);
        }

        basicExplanation = basicExplanation.trim();

        const responseText = basicExplanation
          ? `${basicExplanation}\n\n(tell me more about ${knowledgeResult.searchTerm} for full details)`
          : "Claude has knowledge about this concept, but the content could not be formatted into a basic explanation.";

        // STEP 2 CHANGE #3: Store domain context after successful knowledge query
        return {
          output: responseText,
          success: true,
          source: "knowledge",
          responseType: "CaseA-KnowledgeOnly",
          knowledgeCount: knowledgeResult.count,
          domains: knowledgeResult.domains,
          queryType: queryType,
          entityUsed: enginePayload.entity,
          // STEP 2 CHANGE #3: Store for follow-up context
          storeContext: {
            lastDomains: knowledgeResult.domains,
            lastEntity: knowledgeResult.searchTerm,
            knowledgeIds: knowledgeResult.items?.map(i => i.knowledge_id) || []
          }
        };
      }
    } catch (err) {
      console.error("Knowledge-first lookup error:", err);
    }
  }

  if (!enginePayload.entityType && enginePayload.queryType !== "chat") {
    return {
      output: "Unable to process query (Entity Resolution Failed)",
      success: false,
      entityUsed: enginePayload.entity,
      queryType: enginePayload.queryType
    };
  }

  try {
    const queryResponse = await cotwQueryEngine.executeQuery(enginePayload, session);

    if (!queryResponse) {
      return {
        output: "Unable to process query (Engine returned null)",
        success: false,
        entityUsed: enginePayload.entity,
        entityType: enginePayload.entityType,
        queryType: enginePayload.queryType
      };
    }

    return queryResponse;

  } catch (err) {
    console.error("Standard Query Execution Error:", err);
    return {
      output: "System Error during query execution.",
      success: false,
      error: err.message
    };
  }
}
