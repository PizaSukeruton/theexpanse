import knowledgeAccess from "../utils/knowledgeAccess.js";

export async function getCharacterDomains(characterId) {
  const mappings = await knowledgeAccess.getCharacterKnowledgeSlotMappings(characterId);

  console.log("[KnowledgeLayer] Mappings for character", characterId, mappings);

  if (!mappings || mappings.length === 0) {
    return [];
  }

  const domains = mappings
    .filter(m => m.is_active !== false)
    .map(m => ({ domain_id: m.domain_id }));

  console.log("[KnowledgeLayer] Domains for character", characterId, domains);
  return domains;
}

// STEP 3 CHANGE: Accept contextDomains parameter for follow-up deep retrieval
export async function queryClaudeKnowledge(rawEntity, intentType, characterId, contextDomains = []) {
  console.log("[KnowledgeLayer] queryClaudeKnowledge called with:", {
    rawEntity,
    intentType,
    characterId,
    contextDomainsProvided: contextDomains.length > 0
  });

  if (!rawEntity || !characterId) {
    return {
      found: false,
      items: [],
      count: 0,
      domains: [],
      searchTerm: null,
      intentType
    };
  }

  const searchTerm = rawEntity.trim().toLowerCase();
  console.log("[KnowledgeLayer] Normalized searchTerm:", searchTerm);

  // STEP 3 CHANGE: Prioritize context domains for follow-ups, else fetch character domains
  let domains = [];
  if (contextDomains && contextDomains.length > 0) {
    console.log("[KnowledgeLayer] Using CONTEXT domains (follow-up query):", contextDomains);
    domains = contextDomains;
  } else {
    console.log("[KnowledgeLayer] Using CHARACTER domains (initial query)");
    domains = await getCharacterDomains(characterId);
  }

  console.log("[KnowledgeLayer] Domains resolved:", domains);

  if (!domains || domains.length === 0) {
    return {
      found: false,
      items: [],
      count: 0,
      domains: [],
      searchTerm,
      intentType,
      reason: "character_has_no_domains"
    };
  }

  const domainIds = domains.map(d => d.domain_id);
  console.log("[KnowledgeLayer] Searching knowledge_items in domains:", domainIds);

  const matches = await knowledgeAccess.searchKnowledgeItems(searchTerm, domainIds);
  console.log("[KnowledgeLayer] Matches found:", matches ? matches.length : 0);

  return {
    found: matches && matches.length > 0,
    items: matches || [],
    count: matches ? matches.length : 0,
    domains,
    searchTerm,
    intentType,
    characterId
  };
}

const knowledgeQueryLayer = {
  getCharacterDomains,
  queryClaudeKnowledge
};

export default knowledgeQueryLayer;
