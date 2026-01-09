import { searchEntityWithDisambiguation, searchEntityAllTiers } from "../utils/tieredEntitySearch.js";
import { getAllEntitiesInRealm } from '../utils/entityHelpers.js';

class CotwIntentMatcher {
  constructor() {
    // TIER 1: STRICT PATTERNS (High Confidence)
    // REMOVED 'CAN' to allow loose matching to handle polite requests better.
    this.intents = {
      EDIT_PROFILE: [ // NEW INTENT ADDED
        /^edit (.+?)$/i,
        /^open (.+?)$/i
      ],
      WHO: [
        /^who is (.+?)$/i,
        /^who are the (.+?)$/i,
        /^tell me about (.+?)$/i,
        /^identify (.+?)$/i,
        /^show me (.+?)$/i
      ],
      WHAT: [
        /^what is (.+?)$/i,
        /^what are (.+?)$/i,
        /^define (.+?)$/i,
        /^explain (.+?)$/i
      ],
      WHEN: [
        /^when did (.+?)$/i,
        /^when was (.+?)$/i,
        /^when will (.+?)$/i,
        /^what time (.+?)$/i
      ],
      WHERE: [
        /^where is (.+?)$/i,
        /^where are (.+?)$/i,
        /^where did (.+?)$/i,
        /^location of (.+?)$/i
      ],
      WHY: [
        /^why did (.+?)$/i,
        /^why is (.+?)$/i,
        /^why does (.+?)$/i,
        /^reason for (.+?)$/i
      ],
      HOW: [
        /^how does (.+?)$/i,
        /^how did (.+?)$/i,
        /^how to (.+?)$/i,
        /^how is (.+?)$/i
      ],
      WHICH: [
        /^which (?:character|person|entity|one) (?:is|has|was) (?:the |a |an )?(.+)$/i,
        /^which (.+)$/i
      ],
      IS: [
        /^is ([a-zA-Z0-9\s]+) (?:a|an|the) (.+?)$/i,
        /^are ([a-zA-Z0-9\s]+) (.+?)$/i
      ],
      SEARCH: [
        /^search for (.+?)$/i,
        /^find (.+?)$/i,
        /^lookup (.+?)$/i,
        /^query (.+?)$/i
      ]
    };

    // TIER 2: KEYWORD MAPPING (Loose Match)
    this.keywordMap = {
      'who': 'WHO',
      'whom': 'WHO',
      'identify': 'WHO',
      'character': 'WHO',
      'person': 'WHO',
      
      'what': 'WHAT',
      'define': 'WHAT',
      'explain': 'WHAT',
      'meaning': 'WHAT',
      'concept': 'WHAT',
      
      'where': 'WHERE',
      'location': 'WHERE',
      'located': 'WHERE',
      'place': 'WHERE',
      'position': 'WHERE',
      
      'when': 'WHEN',
      'time': 'WHEN',
      'date': 'WHEN',
      
      'why': 'WHY',
      'reason': 'WHY',
      'cause': 'WHY',
      
      'how': 'HOW',
      'mechanism': 'HOW',
      'method': 'HOW',
      
      'search': 'SEARCH',
      'find': 'SEARCH',
      'look': 'SEARCH',
      'get': 'SEARCH'
    };

    // Conversational noise to strip before analyzing
    this.noisePatterns = [
      /^(?:can|could|would|will) (?:you|i) (?:please )?(?:tell me |show me |find |give me )?/i,
      /^(?:please |kindly )/i,
      /^(?:i want to know )/i,
      /^(?:tell me )/i
    ];

    this.entityCache = new Map(); 
    this.cacheTimestamps = new Map();
    this.CACHE_TTL = 300000; 

    // CONVERSATIONAL INTENTS (No entity search needed)
    this.conversationalPatterns = {
      GREETING: [
        /^(hey|hi|hello|howdy|yo|hiya|heya)(\s+claude)?[!.]?$/i,
        /^good\s*(morning|afternoon|evening|day)(\s+claude)?[!.]?$/i,
        /^what'?s\s*up(\s+claude)?[!?.]?$/i,
        /^how('?s\s*it\s*going|'?re\s*you|'?s\s*everything)(\s+claude)?[!?.]?$/i,
        /^greetings(\s+claude)?[!.]?$/i
      ],
      FAREWELL: [
        /^(bye|goodbye|later|cya|see\s*ya|peace|adios)(\s+claude)?[!.]?$/i,
        /^(gotta\s*go|have\s*to\s*go|need\s*to\s*go|heading\s*out)(\s+claude)?[!.]?$/i,
        /^(take\s*care|see\s*you\s*(later|soon|around)|until\s*next\s*time)(\s+claude)?[!.]?$/i,
        /^(good\s*night|night|nite)(\s+claude)?[!.]?$/i
      ],
      GRATITUDE: [
        /^(thanks?|thank\s*you|thx|ty)(\s+(so\s*much|a\s*lot|claude))*[!.]?$/i,
        /^(i\s*)?(really\s*)?(appreciate|grateful)(\s+(it|that|you|claude))*[!.]?$/i,
        /^(much|many)\s*thanks(\s+claude)?[!.]?$/i
      ],
      HOW_ARE_YOU: [
        /^how\s*(are|r)\s*(you|u)(\s*(doing|today|feeling))?(\s+claude)?[!?.]?$/i,
        /^(you\s*)?(doing\s*)?(ok|okay|alright|good)(\s+claude)?[!?.]?$/i,
        /^how('?s|'?re)\s*(things|life|you)(\s+claude)?[!?.]?$/i
      ],
      SELF_INQUIRY: [
        // === 1. IDENTITY ASSERTIONS (CRITICAL - HIGHEST PRIORITY) ===
        /^so\s+you('?re|\s+are)\s+/i,
        /^you('?re|\s+are)\s+(claude|the\s+tanuki|a\s+tanuki|an?\s+ai|a\s+bot|not\s+real|real|my\s+guide)/i,
        
        // === 2. EXPLICIT IDENTITY INQUIRY ===
        /^(who|what)('?re|\s+(exactly\s+)?are)\s+you(\s+claude)?(\s+really)?[!?.]?$/i,
        /^tell\s+(me|us)\s+about\s+(yourself|you)(\s+claude)?[!?.]?$/i,
        /^(present|describe|introduce)\s+(yourself|you)(\s+claude)?[!?.]?$/i,
        /^introduce\s+(claude|the\s+tanuki|this\s+tanuki|this\s+guide)[!?.]?$/i,
        
        // === 3. NAME & NATURE ===
        /^what('?s|\s+is)\s+your\s+(name|identity|nature|story)(\s+claude)?[!?.]?$/i,
        /^what('?s|\s+is)\s+your\s+deal(\s+claude)?[!?.]?$/i,
        /^so\s+who\s+are\s+you(\s+then)?[!?.]?$/i,
        /^so\s+what\s+are\s+you(\s+then)?[!?.]?$/i,
        /^(claude|the\s+tanuki)\s+(is|are)\s+(what|who)[!?.]?$/i,
        
        // === 4. THIRD-PERSON REFERENCE ===
        /^who\s+(exactly\s+)?is\s+(claude|the\s+tanuki)(\s+the\s+tanuki)?[!?.]?$/i,
        /^what\s+is\s+(claude|the\s+tanuki|this\s+tanuki|this\s+guide)[!?.]?$/i,
        /^tell\s+(me|us)\s+about\s+(claude|the\s+tanuki)(\s+the\s+tanuki)?[!?.]?$/i,
        
        // === 5. CAPABILITY & PURPOSE ===
        /^what\s+(can|do)\s+you\s+do(\s+claude)?[!?.]?$/i,
        /^what\s+are\s+you\s+(capable\s+of|able\s+to\s+do|for)(\s+claude)?[!?.]?$/i,
        /^what\s+is\s+your\s+(purpose|job|role|function)(\s+claude)?[!?.]?$/i,
        /^why\s+do\s+you\s+exist[!?.]?$/i,
        
        // === 6. ORIGIN & CREATION ===
        /^where\s+(do\s+you\s+come\s+from|are\s+you\s+from|were\s+you\s+born|did\s+you\s+come\s+from)(\s+claude)?[!?.]?$/i,
        /^what('?s|\s+is)\s+your\s+(origin|background|history)(\s+claude)?[!?.]?$/i,
        /^who\s+(made|created|built|programmed|designed)\s+you(\s+claude)?[!?.]?$/i,
        
        // === 7. NATURE & REALNESS ===
        /^are\s+you\s+(an?\s+)?(real\s+)?(tanuki|yokai|spirit|person|human|bot|ai|robot|program|script)(\s+claude)?[!?.]?$/i,
        /^are\s+you\s+(just\s+)?(an?\s+)?(bot|ai|program|script)[!?.]?$/i,
        /^are\s+you\s+real(\s+though|\s+really)?[!?.]?$/i,
        /^what\s+are\s+you\s+really[!?.]?$/i,
        /^what\s+are\s+you\s+supposed\s+to\s+be[!?.]?$/i,
        /^what\s+kind\s+of\s+(creature|being|entity)\s+are\s+you(\s+claude)?[!?.]?$/i,
        /^is\s+claude\s+(real|alive|a\s+bot|an\s+ai)[!?.]?$/i,
        
        // === 8. RULES & BOUNDARIES ===
        /^what\s+are\s+your\s+(rules|limits|limitations|constraints)[!?.]?$/i,
        /^what\s+won'?t\s+you\s+do[!?.]?$/i,
        /^what\s+can'?t\s+you\s+do[!?.]?$/i,
        
        // === 9. DEEP INQUIRY ===
        /^who\s+are\s+you\s+really[!?.]?$/i,
        /^what\s+are\s+you\s+hiding[!?.]?$/i
      ]
    };

    // Dialogue function mappings for conversational intents
    this.conversationalMappings = {
      GREETING: {
        dialogueFunction: 'social_obligations_management.greet',
        speechAct: 'social.greet'
      },
      FAREWELL: {
        dialogueFunction: 'social_obligations_management.farewell',
        speechAct: 'social.greet'
      },
      GRATITUDE: {
        dialogueFunction: 'social_obligations_management.thank',
        speechAct: 'expressive.thank'
      },
      HOW_ARE_YOU: {
        dialogueFunction: 'expressive.self_disclosure',
        speechAct: 'expressive.self_disclosure'
      },
      SELF_INQUIRY: {
        dialogueFunction: 'expressive.self_disclosure',
        speechAct: 'social.greet',
        usesIdentityModule: true,
        preventLearning: true,
        blocksKnowledgeSearch: true
      }
    };
  }


  // ==========================================
  // SELF_INQUIRY SUBTYPE DETECTION
  // Determines which type of identity question
  // ==========================================
  detectSelfInquirySubtype(normalizedQuery) {
    // ASSERTION - "you're a bot", "so you're an ai"
    if (/^(so\s+)?you('?re|\s+are)\s+/i.test(normalizedQuery)) {
      return 'ASSERTION';
    }
    
    // DEEP - existential questions
    if (/who\s+are\s+you\s+really|what\s+are\s+you\s+hiding/i.test(normalizedQuery)) {
      return 'DEEPER';
    }
    
    // RULES - boundaries and limitations
    if (/rules|limits|limitations|constraints|won'?t\s+you|can'?t\s+you/i.test(normalizedQuery)) {
      return 'RULES';
    }
    
    // ORIGIN - where from, who made
    if (/where\s+(are\s+you\s+from|do\s+you\s+come)|who\s+(made|created|built|programmed|designed)|origin|background|history/i.test(normalizedQuery)) {
      return 'ORIGIN';
    }
    
    // CAPABILITY - what can you do
    if (/what\s+(can|do)\s+you\s+do|capable|purpose|job|role|function|why\s+do\s+you\s+exist/i.test(normalizedQuery)) {
      return 'CAPABILITY';
    }
    
    // NATURE - are you real, are you a bot
    if (/are\s+you\s+(a|an|real|just)|is\s+claude\s+(real|alive|a\s+bot)|what\s+are\s+you\s+really|what\s+kind\s+of/i.test(normalizedQuery)) {
      return 'NATURE';
    }
    
    // NAME - what's your name
    if (/your\s+(name|identity|deal)|so\s+(who|what)\s+are\s+you/i.test(normalizedQuery)) {
      return 'NAME';
    }
    
    // THIRD_PERSON - who is claude, what is the tanuki
    if (/who\s+(exactly\s+)?is\s+(claude|the\s+tanuki)|what\s+is\s+(claude|the\s+tanuki|this\s+guide)|tell\s+(me|us)\s+about\s+(claude|the\s+tanuki)/i.test(normalizedQuery)) {
      return 'THIRD_PERSON';
    }
    
    // Default: IDENTITY (who are you, what are you, tell me about yourself)
    return 'IDENTITY';
  }


  matchConversationalIntent(normalizedQuery) {
    for (const [intentType, patterns] of Object.entries(this.conversationalPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedQuery)) {
          const mapping = this.conversationalMappings[intentType];
          
          // For SELF_INQUIRY, detect subtype
          const subtype = (intentType === 'SELF_INQUIRY') 
            ? this.detectSelfInquirySubtype(normalizedQuery) 
            : null;
          
          return {
            type: intentType,
            subtype: subtype,
            dialogueFunction: mapping.dialogueFunction,
            speechAct: mapping.speechAct,
            confidence: 0.95,
            isConversational: true,
            usesIdentityModule: mapping.usesIdentityModule || false,
            preventLearning: mapping.preventLearning || false,
            blocksKnowledgeSearch: mapping.blocksKnowledgeSearch || false
          };
        }
      }
    }
    return null;
  }

  getRealmFromAccessLevel(accessLevel, realmOverride = null) {
    if (!accessLevel || accessLevel < 1 || accessLevel > 11) {
      throw new Error(`Invalid access_level: ${accessLevel}. Must be 1-11.`);
    }
    
    if (accessLevel === 11) {
      return realmOverride || '#F00000';
    }
    
    const realmNumber = accessLevel - 1;
    const hexValue = realmNumber.toString(16).toUpperCase();
    return `#F0000${hexValue}`;
  }

  async refreshEntityCache(realm_hex_id) {
    const now = Date.now();
    const lastUpdate = this.cacheTimestamps.get(realm_hex_id);
    
    if (this.entityCache.has(realm_hex_id) && lastUpdate && (now - lastUpdate) < this.CACHE_TTL) {
      return; 
    }

    try {
      const entities = await getAllEntitiesInRealm(realm_hex_id, null, 1000);
      this.entityCache.set(realm_hex_id, entities);
      this.cacheTimestamps.set(realm_hex_id, now);
      console.log(`✅ Entity cache refreshed for ${realm_hex_id}: ${entities.length} entities`);
    } catch (error) {
      console.error(`Failed to refresh entity cache for ${realm_hex_id}:`, error);
      this.entityCache.set(realm_hex_id, []);
    }
  }
  
  cleanQuery(query) {
    return query
      .toLowerCase()
      .trim()
      .replace(/[?!.,;:]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  matchLooseIntent(normalizedQuery) {
    let workingQuery = normalizedQuery;

    for (const pattern of this.noisePatterns) {
      workingQuery = workingQuery.replace(pattern, '').trim();
    }

    const tokens = workingQuery.split(' ');
    if (tokens.length === 0) return null;

    const firstWord = tokens[0];
    const intentType = this.keywordMap[firstWord];

    if (intentType) {
      let entityRaw = workingQuery.substring(firstWord.length).trim();
      const connectorPattern = /^(?:is|are|was|were|does|did|the|a|an)\s+/i;
      entityRaw = entityRaw.replace(connectorPattern, '').trim();

      if (entityRaw.length > 0) {
        return {
          type: intentType,
          entity: entityRaw,
          confidence: 0.6 
        };
      }
    }

    return null;
  }

  async matchIntent(query, context = null, user = null, realmOverride = null) {
    if (!user || !user.access_level) {
      throw new Error('User object with access_level is required');
    }

    const realm_hex_id = this.getRealmFromAccessLevel(user.access_level, realmOverride);
    const normalized = this.cleanQuery(query);
    
    await this.refreshEntityCache(realm_hex_id);
    
    const useGodMode = user.access_level === 11;

    // --- STAGE 0: CONVERSATIONAL INTENTS ---
    // Greetings, farewells, gratitude - no entity search needed
    const conversationalMatch = this.matchConversationalIntent(normalized);
    if (conversationalMatch) {
      console.log('[IntentMatcher] Conversational intent detected: ' + conversationalMatch.type);
      return {
        type: conversationalMatch.type,
        subtype: conversationalMatch.subtype,
        dialogueFunction: conversationalMatch.dialogueFunction,
        speechAct: conversationalMatch.speechAct,
        confidence: conversationalMatch.confidence,
        original: query,
        isConversational: true,
        realm: realm_hex_id,
        matcherMethod: 'conversational'
      };
    }
    
    // --- CONTEXT AWARE PRONOUNS ---
    // Handles 'who is he', 'where is she', etc.
    if (context && context.lastEntity) {
      const pronounPatterns = /^(who|what|where|when|why|how|which|is) (?:is|was|are|were)? (?:he|she|it|they|that|this)$/i;
      if (pronounPatterns.test(normalized)) {
        const intentWord = normalized.match(/^(who|what|where|when|why|how|which|is)/i)[1].toUpperCase();
        
        let godModeData = null;
        if (useGodMode) {
          godModeData = await searchEntityAllTiers(context.lastEntity, realm_hex_id);
        }

        return {
          type: intentWord,
          entity: context.lastEntity,
          confidence: 0.85,
          original: query,
          contextUsed: true,
          godModeSearch: godModeData,
          realm: realm_hex_id,
          matcherMethod: 'context_memory'
        };
      }
    }

    // --- CONFIRMATIONS ---
    if (context && context.lastQueryType && context.conversationTurns > 0) {
      const affirmative = /^(yes|yep|yeah|correct|that's it|that's right|yup|ya|yea)$/i;
      const negative = /^(no|nope|wrong|not that|not it|nah|nay)$/i;
      
      if (affirmative.test(normalized)) {
        const intentWord = context.lastQueryType;
        let godModeData = null;
        if (useGodMode) {
          godModeData = await searchEntityAllTiers(context.lastEntity, realm_hex_id);
        }
        return {
          type: intentWord,
          entity: context.lastEntity,
          confidence: 0.95,
          original: query,
          contextUsed: true,
          confirmation: 'affirmed',
          godModeSearch: godModeData,
          realm: realm_hex_id,
          matcherMethod: 'conversation_flow'
        };
      }
      
      if (negative.test(normalized)) {
        return {
          type: 'SEARCH',
          entity: normalized,
          confidence: 0.5,
          original: query,
          contextUsed: false,
          confirmation: 'rejected',
          realm: realm_hex_id,
          matcherMethod: 'conversation_flow'
        };
      }
    }

    // --- IMAGES ---
    if (normalized.match(/(?:show|display|see|view).*(?:picture|photo|image|pic|portrait|visual)/i)) {
      const patterns = [
        /(?:picture|photo|image|pic|portrait|visual)\s+(?:of|for)\s+(.+?)$/i,
        /(.+?)(?:'s)?\s+(?:picture|photo|image|pic|portrait|visual)$/i,
        /(?:show|display|see|view)\s+(?:me\s+)?(.+?)$/i
      ];
      
      const PRONOUNS = /^(he|she|it|they|that|this|him|her)$/i; // Definition of pronouns
      
      for (const pattern of patterns) {
        const match = normalized.match(pattern);
        if (match && match[1]) {
          const entityName = match[1].trim();
          let entityToSearch = entityName;
          let contextOverride = false;
          
          // NEW LOGIC: Check for pronoun context in image requests
          if (PRONOUNS.test(entityName) && context && context.lastEntity) {
            entityToSearch = context.lastEntity;
            contextOverride = true;
          }
          
          if (useGodMode) {
            const allTiersResult = await searchEntityAllTiers(entityToSearch, realm_hex_id);
            return {
              type: 'SHOW_IMAGE',
              entity: entityToSearch,
              confidence: 0.7,
              original: query,
              contextUsed: contextOverride,
              godModeSearch: allTiersResult,
                entityData: (allTiersResult.tier1?.matches?.[0]) || (allTiersResult.tier2?.matches?.[0]) || (allTiersResult.tier3?.matches?.[0]) || null,
                realm: realm_hex_id,
              matcherMethod: 'visual_request'
            };
          }
          
          const searchResult = await searchEntityWithDisambiguation(entityToSearch, realm_hex_id);
          return {
            type: 'SHOW_IMAGE',
            entity: searchResult.action === 'single_match' ? searchResult.entity.entity_name : entityToSearch,
            entityData: searchResult.action === 'single_match' ? searchResult.entity : null,
            confidence: searchResult.confidence || 0.7,
            original: query,
            searchResult: searchResult,
            realm: realm_hex_id,
            matcherMethod: 'visual_request'
          };
        }
      }
    }
    
    // --- STAGE 1: STRICT REGEX MATCHING ---
    for (const [intentType, patterns] of Object.entries(this.intents)) {
      for (const pattern of patterns) {
        const match = normalized.match(pattern);
        if (match) {
          const entity = match[1] ? match[1].trim().replace(/[?!.,;:]+$/, '') : null;
          if (entity) {
            if (useGodMode) {
              const allTiersResult = await searchEntityAllTiers(entity, realm_hex_id);
              return {
                type: intentType,
                entity: entity,
                confidence: 0.9, 
                original: query,
                entityData: (allTiersResult.tier1?.matches?.[0]) || (allTiersResult.tier2?.matches?.[0]) || (allTiersResult.tier3?.matches?.[0]) || null,
                godModeSearch: allTiersResult,
                realm: realm_hex_id,
                matcherMethod: 'strict_regex'
              };
            }
            
            const searchResult = await searchEntityWithDisambiguation(entity, realm_hex_id);
            return {
              type: intentType,
              entity: searchResult.action === 'single_match' ? searchResult.entity.entity_name : entity,
              entityData: searchResult.action === 'single_match' ? searchResult.entity : null,
              confidence: searchResult.confidence || 0.9,
              original: query,
              searchResult: searchResult,
              realm: realm_hex_id,
              matcherMethod: 'strict_regex'
            };
          }
        }
      }
    }
    
    // --- STAGE 2: LOOSE KEYWORD MATCHING ---
    const looseMatch = this.matchLooseIntent(normalized);
    if (looseMatch) {
      if (useGodMode) {
        const allTiersResult = await searchEntityAllTiers(looseMatch.entity, realm_hex_id);
        return {
          type: looseMatch.type,
          entity: looseMatch.entity,
          confidence: looseMatch.confidence,
          original: query,
          godModeSearch: allTiersResult,
          realm: realm_hex_id,
          matcherMethod: 'loose_keyword'
        };
      }

      const searchResult = await searchEntityWithDisambiguation(looseMatch.entity, realm_hex_id);
      return {
        type: looseMatch.type,
        entity: searchResult.action === 'single_match' ? searchResult.entity.entity_name : looseMatch.entity,
        entityData: searchResult.action === 'single_match' ? searchResult.entity : null,
        confidence: searchResult.confidence || looseMatch.confidence,
        original: query,
        searchResult: searchResult,
        realm: realm_hex_id,
        matcherMethod: 'loose_keyword'
      };
    }

    // --- STAGE 3: FALLBACK SEARCH ---
    if (useGodMode) {
      const allTiersResult = await searchEntityAllTiers(normalized, realm_hex_id);
      return {
        type: 'SEARCH',
        entity: normalized,
        confidence: 0.5,
        original: query,
        godModeSearch: allTiersResult,
        realm: realm_hex_id,
        matcherMethod: 'fallback'
      };
    }
    
    const searchResult = await searchEntityWithDisambiguation(normalized, realm_hex_id);
    return {
      type: 'SEARCH',
      entity: searchResult.action === 'single_match' ? searchResult.entity.entity_name : normalized,
      entityData: searchResult.action === 'single_match' ? searchResult.entity : null,
      confidence: searchResult.confidence || 0.5,
      original: query,
      searchResult: searchResult,
      realm: realm_hex_id,
      matcherMethod: 'fallback'
    };
  }
}

export default new CotwIntentMatcher();
