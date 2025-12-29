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

    // =========================================
    // IDENTITY INTERCEPT: Self-reference queries for Claude
    // =========================================
    const selfIdentityPatterns = [
      /^you$/i,
      /^yourself$/i,
      /who are you/i,
      /what are you/i,
      /tell me about (you|yourself)/i,
      /who is claude/i,
      /who is the tanuki/i,
      /claude the tanuki/i,
      /your identity/i,
      /what is your name/i
    ];

    const normalizedQuery = (rawEntity || '').trim().toLowerCase();
    // Check WHO or SEARCH intent + regex match
    const isIdentityIntent = intentType === 'WHO' || intentType === 'SEARCH';
    const isSelfIdentityQuery = isIdentityIntent && 
                                selfIdentityPatterns.some(p => p.test(normalizedQuery));

    if (isSelfIdentityQuery && characterId === '#700002') {
      console.log('[KnowledgeLayer] Self-reference detected, querying identity_anchors');
      try {
        const { default: identityModule } = await import('./IdentityModule.js');
        const anchors = await identityModule.getAnchorsByType(characterId, 'core_trait');

        if (anchors && anchors.length > 0) {
          // Sort by entrenchment (strongest beliefs first)
          anchors.sort((a, b) => b.entrenchment_level - a.entrenchment_level);
          const topAnchors = anchors.slice(0, 5);

          return {
            found: true,
            items: topAnchors.map(a => ({
              knowledge_id: a.anchor_id,
              content: a.anchor_text,
              domain_id: '#IDENTITY',
              source_type: 'identity_anchor',
              anchor_type: a.anchor_type,
              entrenchment: a.entrenchment_level
            })),
            count: topAnchors.length,
            domains: [{ domain_id: '#IDENTITY' }],
            searchTerm: normalizedQuery,
            intentType,
            characterId,
            isIdentityResponse: true
          };
        } else {
          // Fallback: anchor table empty, continue to normal knowledge search
          console.warn('[KnowledgeLayer] No identity anchors found, falling back to knowledge search');
        }
      } catch (identityErr) {
        console.error('[KnowledgeLayer] Identity lookup failed:', identityErr.message);
        // Fallback: continue to normal knowledge search
      }
    }
    // =========================================

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
