/**
 * ClaudeBrain.js — Unified Orchestrator for Claude the Tanuki
 * 
 * Version: 1.3 FINAL
 * Date: 2025-12-16
 * 
 * This is the SINGLE orchestration surface for Claude's cognition.
 * It coordinates: intent → canon → lore → voice
 * 
 * Design Principles:
 * - ClaudeBrain is an ORCHESTRATOR, not an ORACLE
 * - It does NOT decide truth
 * - It does NOT own knowledge
 * - It does NOT mutate state directly
 * - It ONLY coordinates existing subsystems
 */

// === IMPORTS ===

// Routing
// import modeRouter from './modeRouter.js'; // REMOVED - not used
import cotwIntentMatcher from './cotwIntentMatcher.js';
import GodModeDebugger from './GodModeDebugger.js';

// Entity Search & Query
import cotwQueryEngine from './cotwQueryEngine.js';

// Knowledge
import knowledgeQueryLayer from '../services/knowledgeQueryLayer.js';

// Voice/LTLM
import { buildStorytellerResponse } from '../services/storytellerWrapper.js';
import { selectLtlmUtteranceForBeat } from '../services/ltlmUtteranceSelector.js';

// Singletons (ONE instance each)
import { getNaturalLanguageGenerator } from './helpers/NaturalLanguageGeneratorSingleton.js';
import SpacedRepetitionScheduler from '../knowledge/SpacedRepetitionScheduler.js';
import KnowledgeAcquisitionEngine from '../knowledge/KnowledgeAcquisitionEngine.js';

// Database
import pool from '../db/pool.js';
import TSELoopManager from '../TSE/TSELoopManager.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Learning System
import learningDetector from '../services/learningDetector.js';
import learningCapturer from '../services/learningCapturer.js';
// === POLICY RULES ===
// All decision logic is defined here and NOWHERE else

const POLICY_RULES = {
  // === AUTO-LORE GATING ===
  autoLore: {
    minConfidence: 0.85,
    allowedIntents: ['WHO', 'WHAT'],
    minPhilosophical: 1
  },
  
  // === CONFIDENCE THRESHOLDS ===
  confidence: {
    high: 0.85,
    medium: 0.65,
    low: 0.0
  },
  
  // === PREFERENCE BLENDING ===
  preferences: {
    tieThreshold: 1,
    cacheTTL: 300000  // 5 minutes
  },
  
  // === VERBOSITY LIMITS ===
  verbosity: {
    brief: {
      maxChars: 150,
      respectWordBoundary: true
    },
    moderate: {
      maxParagraphs: 2
    },
    expansive: {
      maxParagraphs: null
    }
  },
  
  // === MOOD CAPS ===
  mood: {
    lowEnergyThreshold: 0.3,
    playfulCapWhenTired: 1
  }
};

// === MAIN CLASS ===

class ClaudeBrain {
  constructor() {
    console.log('[ClaudeBrain] Initializing unified orchestrator...');
    
    // === SINGLETON INSTANCES ===
    this.nlg = getNaturalLanguageGenerator();
    this.tseManager = getTSELoopManager();
    this.scheduler = new SpacedRepetitionScheduler();
    this.acquisitionEngine = new KnowledgeAcquisitionEngine();
    
    // === CONSTANTS ===
    this.CLAUDE_CHARACTER_ID = "#700002";
    
    // === PREFERENCE CACHE ===
    this.preferenceCache = new Map();
    
    console.log('[ClaudeBrain] Unified orchestrator initialized.');
  }

  // ==========================================
  // MAIN ENTRY POINT
  // ==========================================
  
  async processQuery(command, session, user) {
    const result = {
      success: false,
      output: null,
      confidence: 0,
      source: null,
      style: null,
      context: {}
    };

    try {
      // ==========================================
      // STEP 1: ACCESS CHECK
      // ==========================================
      if (user.access_level === 11) {
        return await this.handleGodMode(command, session, user);
      }

      // ==========================================
      // STEP 2: LOAD USER PREFERENCES
      // ==========================================
      const preferences = await this.getUserPreferences(user.owned_character_id);
      let responseStyle = this.calculateResponseStyle(preferences);
      result.style = responseStyle;

      // ==========================================
      // STEP 3: GET CLAUDE'S MOOD
      // ==========================================
      const mood = await this.getPsychicMood(this.CLAUDE_CHARACTER_ID);
      responseStyle = this.applyMoodModifiers(responseStyle, mood);

      // ==========================================
      // STEP 3.5: EARLY FOLLOW-UP DETECTION
      // ==========================================
      if (this.isFollowUpRequest(command, session) && session.context?.lastEntity) {
        console.log('[ClaudeBrain] Follow-up detected for:', session.context.lastEntity);
        return await this.handleFollowUp(command, session, user, responseStyle);
      }


      // ==========================================
      // STEP 4: INTENT PARSING + ENTITY SEARCH
      // (Delegated to IntentMatcher — it owns search)
      // ==========================================
      const intentResult = await cotwIntentMatcher.matchIntent(
        command,
        session.context,
        user
      );

      // ==========================================
      // STEP 4.25: CONVERSATIONAL INTENT HANDLING
      // ==========================================
      if (intentResult.isConversational) {
        console.log('[ClaudeBrain] Handling conversational intent: ' + intentResult.type);
        
        const utterance = await selectLtlmUtteranceForBeat({
          speakerCharacterId: '700002',
          speechActCode: intentResult.speechAct,
          dialogueFunctionCode: intentResult.dialogueFunction,
          outcomeIntentCode: null,
          targetPad: { pleasure: 0.3, arousal: 0.1, dominance: 0.0 }
        });
        
        return {
          success: true,
          output: utterance?.utteranceText || 'Hey there!',
          source: 'conversational',
          confidence: intentResult.confidence,
          conversational: true,
          intentType: intentResult.type,
          context: session.context
        };
      }

      // ==========================================
      // STEP 4.5: LEARNING DETECTION (if not God Mode)
      // ==========================================
      if (user.access_level !== 11 && !session.context.learning_mode_disabled) {
        try {
          // Check if user is responding to a previous learning request
          if (session.context.learning_active && session.context.learning_phrase) {
            const teaching = await learningCapturer.captureTeaching(user.userid, {
              phrase: session.context.learning_phrase,
              userExplanation: command,
              context: session.context?.lastEntity || 'general_conversation',
              padCoordinates: session.context.learning_signal?.pad || null,
              baseConcept: session.context.learning_signal?.metaphor?.pattern || 'user_taught'
            });
            
            session.context.learning_active = false;
            session.context.learning_phrase = null;
            session.context.learning_signal = null;
            
            return {
              success: true,
              output: `Thank you for teaching me! I've learned "${teaching.learned_phrase}" (ID: ${teaching.language_id}). I'll use it carefully with you first, then see if it works for others.`,
              source: 'learning_capture',
              confidence: 1.0,
              context: session.context
            };
          }
          
        } catch (learningError) {
          console.error('[ClaudeBrain] Learning detection error:', learningError);
        }
      }


      // ==========================================
      // STEP 5: CONFIDENCE ROUTING
      // ==========================================
      const searchResult = intentResult.searchResult;

      if (!searchResult || searchResult.action === 'not_found') {
        return await this.handleNoEntityFound(intentResult, session, user, responseStyle);
      }

      if (searchResult.action === 'confirm') {
        return this.buildConfirmationResponse(searchResult, responseStyle);
      }

      if (searchResult.action === 'disambiguate' || searchResult.action === 'clarify') {
        return this.buildClarificationResponse(searchResult, responseStyle);
      }

      if (searchResult.action === 'refine') {
        return this.buildRefineResponse(searchResult, responseStyle);
      }

      // ==========================================
      // STEP 6: BUILD CANON RESPONSE
      // ==========================================
      const canonResponse = await this.buildCanonResponse(
        intentResult,
        searchResult.entity,
        responseStyle
      );

      // ==========================================
      // STEP 7: LORE ENRICHMENT (gated)
      // ==========================================
      const enrichedResponse = await this.maybeEnrichWithLore(
        canonResponse,
        intentResult,
        searchResult.entity,
        session,
        responseStyle
      );

      // ==========================================
      // STEP 8: RABBIT HOLE OFFER
      // ==========================================
      if (enrichedResponse.knowledgeResult && responseStyle.includeRabbitHoles) {
        const rabbitHole = this.offerRabbitHole(
          enrichedResponse.knowledgeResult, 
          session, 
          responseStyle
        );
        if (rabbitHole) {
          enrichedResponse.rabbitHoleOffered = rabbitHole;
        }
      }

      // ==========================================
      // STEP 9: LTLM STYLING
      // ==========================================
      const styledResponse = await this.applyVoice(
        enrichedResponse,
        intentResult,
        responseStyle,
        mood
      );

      // ==========================================
      // STEP 9.5: TSE COMMUNICATION RECORDING
      // ==========================================
      if (session.tse_mode_active && session.current_tse_task_id) {
        try {
          const attemptId = await generateHexId('tse_task_attempt_id');
          
          await this.tseManager.learningDB.saveTaskAttempt({
            attemptId,
            taskId: session.current_tse_task_id,
            characterId: this.CLAUDE_CHARACTER_ID,
            knowledgeId: session.tse_knowledge_id || null,
            attemptText: styledResponse.output,
            score: null,
            metadata: {
              taskType: 'communication_quality',
              outcome_intent: intentResult.type,
              pad_used: mood,
              storyteller_meta: styledResponse.storytellerMeta,
              entity_name: styledResponse.entity?.entity_name || null
            }
          });
          
          console.log(`[ClaudeBrain] TSE attempt recorded: ${attemptId}`);
        } catch (tseError) {
          console.error('[ClaudeBrain] TSE recording failed:', tseError);
        }
      }

      // ==========================================
      // STEP 10: UPDATE CONTEXT
      // ==========================================
      styledResponse.context = this.updateContext(session, intentResult, styledResponse);

      return styledResponse;

    } catch (error) {
      console.error('[ClaudeBrain] Error:', error);
      result.output = "I encountered an error processing your question.";
      result.error = error.message;
      return result;
    }
  }

  // ==========================================
  // STEP 2: USER PREFERENCES
  // ==========================================

  async getUserPreferences(characterId) {
    if (!characterId) {
      return this.getDefaultPreferences();
    }

    // Check cache
    const cached = this.preferenceCache.get(characterId);
    if (cached && (Date.now() - cached.timestamp) < POLICY_RULES.preferences.cacheTTL) {
      return cached.preferences;
    }

    // Query database
    try {
      const result = await pool.query(`
        SELECT conversation_type_preferences, preferred_rabbit_holes, modeoverrides
        FROM user_tanuki_profile
        WHERE character_id = $1
      `, [characterId]);

      if (result.rows.length === 0) {
        return this.getDefaultPreferences();
      }

      const prefs = result.rows[0].conversation_type_preferences || {};
      const preferences = {
        factual: prefs.factual || 0,
        playful: prefs.playful || 0,
        philosophical: prefs.philosophical || 0,
        rabbitHoles: result.rows[0].preferred_rabbit_holes || [],
        overrides: result.rows[0].modeoverrides || {}
      };

      // Cache it
      this.preferenceCache.set(characterId, {
        preferences,
        timestamp: Date.now()
      });

      return preferences;

    } catch (error) {
      console.error('[ClaudeBrain] Error loading preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  invalidatePreferenceCache(characterId) {
    if (characterId) {
      this.preferenceCache.delete(characterId);
      console.log(`[ClaudeBrain] Preference cache invalidated for ${characterId}`);
    } else {
      this.preferenceCache.clear();
      console.log('[ClaudeBrain] All preference caches cleared');
    }
  }

  getDefaultPreferences() {
    return {
      factual: 0,
      playful: 0,
      philosophical: 0,
      rabbitHoles: [],
      overrides: {}
    };
  }

  // ==========================================
  // PREFERENCE STYLE CALCULATION
  // ==========================================

  calculateResponseStyle(preferences) {
    const { factual, playful, philosophical } = preferences;
    const scores = { factual, playful, philosophical };
    
    // v1.3: Stable sort with alphabetical secondary key
    const sorted = Object.entries(scores)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    
    const [first, second] = sorted;
    
    // Check for tie/blend
    const scoreDiff = first[1] - second[1];
    const bothPositive = first[1] > 0 && second[1] > 0;
    
    let primary;
    let isBlend = false;
    
    if (scoreDiff <= POLICY_RULES.preferences.tieThreshold && bothPositive) {
      // BLEND: sorted alphabetically for consistency
      primary = [first[0], second[0]].sort().join('-');
      isBlend = true;
    } else {
      primary = first[0];
    }

    return {
      primary,
      isBlend,
      intensity: first[1],
      blend: scores,
      verbosity: this.calculateVerbosity(scores),
      offerMore: this.calculateOfferStyle(scores),
      ltlmIntensity: this.calculateLTLMIntensity(scores),
      autoEnrichLore: this.shouldAutoEnrichLore(scores),
      includeRabbitHoles: philosophical >= 2,
      morePrompt: this.getMorePrompt(primary, first[1])
    };
  }

  calculateVerbosity(scores) {
    if (scores.factual >= 2) return 'brief';
    if (scores.philosophical >= 2) return 'expansive';
    return 'moderate';
  }

  calculateOfferStyle(scores) {
    if (scores.factual >= 2) return 'explicit';
    if (scores.philosophical >= 2) return 'proactive';
    return 'natural';
  }

  calculateLTLMIntensity(scores) {
    if (scores.playful >= 2) return 'high';
    if (scores.playful <= -1) return 'minimal';
    return 'moderate';
  }

  shouldAutoEnrichLore(scores) {
    return scores.philosophical >= POLICY_RULES.autoLore.minPhilosophical;
  }

  getMorePrompt(style, intensity) {
    const prompts = {
      'factual': "Want to know more?",
      'playful': "There's quite a story there, if you're curious...",
      'philosophical': "Shall I take you down that rabbit hole?",
      'factual-playful': "There's more to this — interested?",
      'factual-philosophical': "Want the deeper context?",
      'playful-philosophical': "Oh, there's so much more to explore here..."
    };
    
    return prompts[style] || "Would you like to know more?";
  }

  // ==========================================
  // STEP 3: PSYCHIC MOOD
  // ==========================================

  async getPsychicMood(characterId) {
    try {
      const result = await pool.query(`
        SELECT p, a, d FROM psychic_moods
        WHERE character_id = $1
        LIMIT 1
      `, [characterId]);

      if (result.rows.length === 0) {
        return this.getDefaultMood();
      }

      const row = result.rows[0];
      return {
        pleasure: parseFloat(row.p),
        arousal: parseFloat(row.a),
        dominance: parseFloat(row.d),
        energy_level: parseFloat(row.a)  // Arousal as energy proxy
      };
    } catch (error) {
      console.error('[ClaudeBrain] Error fetching mood:', error);
      return this.getDefaultMood();
    }
  }

  // v1.3: Default to neutral (0.5), not manic (1.0)
  getDefaultMood() {
    return {
      pleasure: 0.5,
      arousal: 0.3,
      dominance: 0.5,
      energy_level: 0.5
    };
  }

  applyMoodModifiers(responseStyle, mood) {
    const modified = { ...responseStyle };

    if (mood.energy_level < POLICY_RULES.mood.lowEnergyThreshold) {
      if (modified.ltlmIntensity === 'high') {
        modified.ltlmIntensity = 'moderate';
        modified.moodCapped = true;
        console.log('[ClaudeBrain] Playful intensity capped due to low energy');
      }
    }

    return modified;
  }

  // ==========================================
  // AUTO-LORE GATING
  // ==========================================

  shouldAutoEnrich(intentResult, searchResult, responseStyle) {
    if (!responseStyle.autoEnrichLore) {
      return { allowed: false, reason: 'User preference does not allow auto-lore' };
    }

    if (!searchResult || searchResult.confidence < POLICY_RULES.autoLore.minConfidence) {
      return { 
        allowed: false, 
        reason: `Confidence ${searchResult?.confidence || 0} below threshold ${POLICY_RULES.autoLore.minConfidence}` 
      };
    }

    if (!POLICY_RULES.autoLore.allowedIntents.includes(intentResult.type)) {
      return { 
        allowed: false, 
        reason: `Intent type ${intentResult.type} not in allowed list` 
      };
    }

    return { allowed: true };
  }

  // ==========================================
  // STEP 6: CANON RESPONSE
  // ==========================================


  async buildCanonResponse(intentResult, entity, responseStyle) {
    const fullData = await cotwQueryEngine.fetchSourceRow(entity);
    const enrichedEntity = { ...entity, ...fullData };

    let output = this.formatEntityResponse(intentResult.type, enrichedEntity);

    // Handle SHOW_IMAGE returning an object
    if (typeof output === "object" && output.action === "show_image") {
      return {
        success: true,
        output: output.text,
        image: output.image,
        action: "show_image",
        source: "canon",
        entity: enrichedEntity,
        intentType: intentResult.type
      };
    }

    if (responseStyle.verbosity === "brief") {
      output = this.truncateToEssentials(output);
    } else if (responseStyle.verbosity === "expansive") {
      output = this.expandWithContext(output, enrichedEntity);
    }

    output += `\n\n${responseStyle.morePrompt}`;

    return {
      success: true,
      output,
      source: "canon",
      entity: enrichedEntity,
      intentType: intentResult.type
    };
  }

  formatEntityResponse(intentType, entity) {
    switch (intentType) {
      case 'WHO':
        return this.formatWhoResponse(entity);
      case 'WHERE':
        return this.formatWhereResponse(entity);
      case 'WHAT':
        return this.formatWhatResponse(entity);
      case 'WHEN':
        return this.formatWhenResponse(entity);
      case 'SEARCH':
        return this.formatWhatResponse(entity);
      case 'SHOW_IMAGE':
        return this.formatShowImageResponse(entity);
      default:
        return this.formatGenericResponse(entity);
    }
  }

  formatWhoResponse(entity) {
    const name = entity.entity_name || entity.character_name || 'Unknown';
    const category = entity.category || '';
    const description = entity.description || entity.content || entity.search_context || '';
    
    let response = `**${name}**`;
    if (category) response += ` (${category})`;
    response += '\n';
    if (description) response += description;
    
    return response;
  }

  formatWhereResponse(entity) {
    const name = entity.entity_name || entity.name || 'Unknown';
    const realm = entity.realm || '';
    const description = entity.description || '';
    
    let response = `**${name}**`;
    if (realm) response += ` is in realm ${realm}`;
    response += '\n';
    if (description) response += description;
    
    return response;
  }

  formatWhatResponse(entity) {
    const name = entity.entity_name || entity.name || 'Unknown';
    const description = entity.description || entity.content || entity.search_context || '';
    
    return `**${name}**\n${description}`;
  }

  formatWhenResponse(entity) {
    const name = entity.entity_name || entity.name || 'Unknown';
    const timestamp = entity.timestamp || entity.created_at || '';
    
    let response = `**${name}**`;
    if (timestamp) {
      const date = new Date(timestamp);
      response += `\nOccurred: ${date.toLocaleString()}`;
    }
    
    return response;
  }

  formatShowImageResponse(entity) {
    const name = entity.entity_name || entity.character_name || "Unknown";
    const imageUrl = entity.image_url || entity.profile_image || null;
    
    if (imageUrl) {
      return {
        text: `**${name}**`,
        image: imageUrl,
        action: "show_image"
      };
    }
    
    return `**${name}**\nNo image available.`;
  }

  formatGenericResponse(entity) {
    const name = entity.entity_name || entity.name || 'Unknown';
    const description = entity.description || entity.content || entity.search_context || '';
    
    return `**${name}**\n${description}`;
  }

  truncateToEssentials(output, maxChars = POLICY_RULES.verbosity.brief.maxChars) {
    // First, try to get first complete sentence
    const firstSentence = output.match(/^[^.!?]+[.!?]/);
    if (firstSentence && firstSentence[0].length <= maxChars) {
      return firstSentence[0];
    }

    if (output.length <= maxChars) {
      return output;
    }

    // Find last space before maxChars (word boundary)
    const truncatePoint = output.lastIndexOf(' ', maxChars);
    
    if (truncatePoint === -1) {
      return output.substring(0, maxChars) + '...';
    }

    return output.substring(0, truncatePoint) + '...';
  }

  expandWithContext(output, entity) {
    let expanded = output;
    
    if (entity.current_location) {
      expanded += `\n\nCurrently located at: ${entity.current_location}`;
    }
    
    return expanded;
  }

  // ==========================================
  // STEP 7: LORE ENRICHMENT
  // ==========================================

  async maybeEnrichWithLore(response, intentResult, entity, session, responseStyle) {
    const isFollowUp = this.isFollowUpRequest(intentResult.original, session);
    
    if (!isFollowUp) {
      const gateCheck = this.shouldAutoEnrich(
        intentResult, 
        intentResult.searchResult, 
        responseStyle
      );
      
      if (!gateCheck.allowed) {
        console.log(`[ClaudeBrain] Auto-lore blocked: ${gateCheck.reason}`);
        return response;
      }
    }

    const searchTerm = entity.entity_name || intentResult.entity;
    const knowledgeResult = await knowledgeQueryLayer.queryClaudeKnowledge(
      searchTerm,
      intentResult.type,
      this.CLAUDE_CHARACTER_ID,
      session.context?.lastDomains || []
    );

    if (!knowledgeResult || !knowledgeResult.found || !knowledgeResult.items || knowledgeResult.items.length === 0) {
      return response;
    }

    const lastIndex = session.context?.lastKnowledgeIndex ?? -1;
    const nextIndex = isFollowUp 
      ? (lastIndex + 1) % knowledgeResult.items.length 
      : 0;
    const item = knowledgeResult.items[nextIndex];

    let loreContent = this.formatKnowledgeItem(item, responseStyle.verbosity);

    if (responseStyle.includeRabbitHoles && knowledgeResult.items.length > 1) {
      loreContent += `\n\n(I have ${knowledgeResult.items.length - 1} more insights on this topic...)`;
    }

    // v1.3: Explicitly attach knowledgeResult for Step 8
    return {
      ...response,
      output: response.output + '\n\n' + loreContent,
      source: 'canon+lore',
      loreAdded: true,
      knowledgeResult,
      storeContext: {
        lastDomains: knowledgeResult.domains || [],
        lastEntity: searchTerm,
        knowledgeIds: knowledgeResult.items.map(i => i.knowledge_id),
        lastKnowledgeIndex: nextIndex
      }
    };
  }

  formatKnowledgeItem(item, verbosity) {
    const content = item.content || '';
    
    if (verbosity === 'brief') {
      const firstPara = content.split('\n\n')[0];
      return firstPara;
    }
    
    if (verbosity === 'expansive') {
      return content;
    }
    
    const paragraphs = content.split('\n\n');
    return paragraphs.slice(0, 2).join('\n\n');
  }

  isFollowUpRequest(command, session) {
    if (!command) return false;
    if (!session.context?.lastEntity) return false;
    
    const normalized = command.toLowerCase().trim();
    const followUpPatterns = [
      /^tell me more/i,
      /^more( please)?$/i,
      /^yes( please)?$/i,
      /^go on/i,
      /^continue/i,
      /^what else/i,
      /^and\?$/i,
      /^deeper/i,
      /^rabbit hole/i,
      /^take me down/i,
      /^explore that/i
    ];

    return followUpPatterns.some(p => p.test(normalized));
  }

  // ==========================================
  // STEP 8: RABBIT HOLE SYSTEM
  // ==========================================

  offerRabbitHole(knowledgeResult, session, responseStyle) {
    // Gate 1: User preference
    if (!responseStyle.includeRabbitHoles) {
      return null;
    }
    
    // v1.3: Null safety - ensure we have at least 2 items
    if (!knowledgeResult || !knowledgeResult.items || knowledgeResult.items.length < 2) {
      return null;
    }

    const nextItem = knowledgeResult.items[1];
    
    // v1.3: Additional null check on item properties
    if (!nextItem || !nextItem.knowledge_id) {
      return null;
    }

    session.context = session.context || {};
    session.context.offeredRabbitHole = {
      topic: nextItem.concept || 'related topic',
      knowledgeId: nextItem.knowledge_id,
      offeredAt: new Date().toISOString()
    };

    return {
      prompt: responseStyle.morePrompt,
      topic: nextItem.concept,
      knowledgeId: nextItem.knowledge_id
    };
  }

  async handleRabbitHoleAcceptance(session) {
    const offer = session.context?.offeredRabbitHole;
    
    if (!offer) {
      return null;
    }

    const result = await pool.query(`
      SELECT * FROM knowledge_items WHERE knowledge_id = $1
    `, [offer.knowledgeId]);

    if (result.rows.length === 0) {
      return null;
    }

    session.context.offeredRabbitHole = null;

    return result.rows[0];
  }

  // ==========================================
  // STEP 9: LTLM STYLING
  // ==========================================

  async applyVoice(response, intentResult, responseStyle, mood) {
    // ========================================
    // 1. CHECK INTENSITY PREFERENCE
    // ========================================
    if (responseStyle.ltlmIntensity === 'minimal') {
      console.log('[ClaudeBrain] LTLM skipped: minimal intensity preference');
      return response;
    }

    // ========================================
    // 2. MAP RESPONSE STYLE TO LTLM PARAMS
    // ========================================
    const tone = responseStyle.primary && responseStyle.primary.includes('playful') 
      ? 'playful'
      : 'neutral';
      
    const formality = responseStyle.verbosity === 'brief' ? 'formal' : 'casual';

    let emotionalSignal = 'neutral';
    if (mood) {
      if (mood.energy_level < 0.3) {
        emotionalSignal = 'tired';
      } else if (mood.pleasure < 0.3) {
        emotionalSignal = 'frustrated';
      }
    }

    try {
      // ========================================
      // 3. BUILD CONTENT BLOCKS (DETERMINISTIC ORDER)
      // ========================================
      let contentBlocks = [];

      if (response.output) {
        let mainContent = response.output;
        
        // Remove existing prompts that will be replaced by LTLM closer
        mainContent = mainContent.replace(
          /\n\n(Want to know more\?|Shall I take you down that rabbit hole\?|There's quite a story there.*|Would you like to know more\?).*$/i, 
          ''
        ).trim();
        
        // If lore was added, split back into semantic blocks
        if (response.loreAdded && response.storeContext?.lastEntity) {
          const parts = mainContent.split(/\n\n+/);
          if (parts.length > 1) {
            contentBlocks.push(parts[0].trim());
            contentBlocks.push(parts.slice(1).join('\n\n').trim());
          } else {
            contentBlocks.push(mainContent);
          }
        } else {
          contentBlocks.push(mainContent);
        }
      }

      contentBlocks = contentBlocks.filter(b => b && b.trim().length > 0);

      if (contentBlocks.length === 0) {
        console.log('[ClaudeBrain] LTLM skipped: no content blocks');
        return response;
      }

      // ========================================
      // 4. CALL STORYTELLER
      // ========================================
      console.log(`[ClaudeBrain] Applying LTLM voice: ${contentBlocks.length} block(s), tone=${tone}`);
      
      const storytellerResult = await buildStorytellerResponse({
        intentResult,
        emotionalSignal,
        contentBlocks,
        tone,
        formality
      });

      // ========================================
      // 5. RETURN STYLED RESPONSE
      // ========================================
      if (storytellerResult.output && storytellerResult.storytellerMeta?.usedStoryteller) {
        let styledOutput = storytellerResult.output;
        if (responseStyle.morePrompt && !styledOutput.includes('?')) {
          styledOutput += `\n\n${responseStyle.morePrompt}`;
        }

        return {
          ...response,
          output: styledOutput,
          storytellerMeta: storytellerResult.storytellerMeta
        };
      }

      return response;

    } catch (error) {
      console.error('[ClaudeBrain] Storyteller error:', error);
      return response;
    }
  }

  // ==========================================
  // CONFIDENCE RESPONSE BUILDERS
  // ==========================================

  buildConfirmationResponse(searchResult, responseStyle) {
    let message = searchResult.message;
    
    if (responseStyle.ltlmIntensity === 'high') {
      message = `Hmm, ${message} The names in The Expanse can be tricky!`;
    }

    return {
      success: true,
      output: message,
      requiresConfirmation: true,
      confidence: searchResult.confidence,
      pendingEntity: searchResult.entity,
      context: { pendingEntity: searchResult.entity }
    };
  }

  buildClarificationResponse(searchResult, responseStyle) {
    let message = searchResult.message;
    
    if (searchResult.options) {
      const optionsList = searchResult.options
        .map(opt => `${opt.number}. ${opt.entity_name} (${opt.entity_type})`)
        .join('\n');
      message += '\n' + optionsList;
    }

    return {
      success: true,
      output: message,
      requiresClarification: true,
      options: searchResult.options,
      confidence: searchResult.confidence
    };
  }

  buildRefineResponse(searchResult, responseStyle) {
    let message = searchResult.message;
    
    if (searchResult.top_matches) {
      const examples = searchResult.top_matches
        .map(m => `- ${m.entity_name} (${m.entity_type})`)
        .join('\n');
      message += '\n\nSome examples:\n' + examples;
    }

    return {
      success: true,
      output: message,
      requiresRefinement: true
    };
  }

  async handleNoEntityFound(intentResult, session, user, responseStyle) {
    const knowledgeResult = await knowledgeQueryLayer.queryClaudeKnowledge(
      intentResult.entity,
      intentResult.type,
      this.CLAUDE_CHARACTER_ID,
      []
    );

    if (knowledgeResult && knowledgeResult.found && knowledgeResult.items && knowledgeResult.items.length > 0) {
      const item = knowledgeResult.items[0];
      let output = this.formatKnowledgeItem(item, responseStyle.verbosity);
      output += `\n\n${responseStyle.morePrompt}`;

      return {
        success: true,
        output,
        source: 'lore',
        confidence: 0.7,
        knowledgeResult,
        storeContext: {
          lastDomains: knowledgeResult.domains || [],
          lastEntity: intentResult.entity,
          knowledgeIds: knowledgeResult.items.map(i => i.knowledge_id),
          lastKnowledgeIndex: 0
        }
      };
    }

    if (user.access_level !== 11 && !session.context.learning_mode_disabled) {
      try {
        const learningSignal = await learningDetector.detectLearningOpportunity(
          intentResult.original || intentResult.entity,
          user.owned_character_id
        );
        
        if (learningSignal.shouldAsk && !session.context.learning_active) {
          session.context.learning_active = true;
          session.context.learning_phrase = learningSignal.phrase;
          session.context.learning_signal = learningSignal;
          
          console.log('[ClaudeBrain] Learning opportunity detected:', {
            phrase: learningSignal.phrase,
            signals: learningSignal.triggeredSignalNames,
            confidence: learningSignal.confidence
          });
          const learningRequest = await selectLtlmUtteranceForBeat({
            speakerCharacterId: this.CLAUDE_CHARACTER_ID.replace("#", ""),
            speechActCode: 'directive.request',
            dialogueFunctionCode: 'metacommunication.learning_request',
            outcomeIntentCode: null,
            targetPad: { pleasure: 0.22, arousal: 0.33, dominance: -0.17 }
          });
          
          console.log('[ClaudeBrain] LTLM utterance selected:', learningRequest);
          
          return {
            success: true,
            output: learningRequest?.utteranceText || `That's a vivid way to express it. I'm still learning how humans describe feelings like that — can you teach me more about what it means to you?`,
            source: 'learning_request',
            confidence: learningSignal.confidence,
            learningActive: true,
            context: session.context
          };
        }
      } catch (learningError) {
        console.error('[ClaudeBrain] Learning detection error:', learningError);
      }
    }

    return {
      success: false,
      output: `I couldn't find anything about "${intentResult.entity}" in this realm. Can you tell me more about what you're looking for?`,
      source: 'none',
      confidence: 0
    };
  }

  // ==========================================
  // GOD MODE
  // ==========================================

  async handleGodMode(command, session, user) {
    const intentResult = await cotwIntentMatcher.matchIntent(
      command,
      session.context,
      user
    );

    return await GodModeDebugger(intentResult, user, command, session);
  }

  // ==========================================
  // CONTEXT MANAGEMENT
  // ==========================================

  updateContext(session, intentResult, response) {
    const context = session.context || {};

    if (response.entity) {
      context.lastEntity = response.entity.entity_name;
      context.lastEntityType = response.entity.entity_type;
      context.lastEntityId = response.entity.entity_id;
    }

    if (response.storeContext) {
      context.lastDomains = response.storeContext.lastDomains;
      context.knowledgeIds = response.storeContext.knowledgeIds;
      context.lastKnowledgeIndex = response.storeContext.lastKnowledgeIndex;
    }

    context.lastQueryType = intentResult.type;
    context.conversationTurns = (context.conversationTurns || 0) + 1;

    return context;
  }
  // ==========================================
  // FOLLOW-UP HANDLER
  // ==========================================

  async handleFollowUp(command, session, user, responseStyle) {
    const lastEntity = session.context.lastEntity;
    const lastEntityId = session.context.lastEntityId;
    
    console.log('[ClaudeBrain] Fetching lore for follow-up:', lastEntity);

    // Query knowledge for the previous entity
    const knowledgeResult = await knowledgeQueryLayer.queryClaudeKnowledge(
      lastEntity,
      session.context.lastQueryType || 'WHO',
      this.CLAUDE_CHARACTER_ID,
      session.context.lastDomains || []
    );

    if (!knowledgeResult || !knowledgeResult.found || !knowledgeResult.items || knowledgeResult.items.length === 0) {
      return {
        success: true,
        output: `I don't have any additional knowledge about ${lastEntity} at the moment.`,
        source: 'none',
        context: session.context
      };
    }

    // Get next knowledge item (cycling)
    const lastIndex = session.context.lastKnowledgeIndex ?? -1;
    const nextIndex = (lastIndex + 1) % knowledgeResult.items.length;
    const item = knowledgeResult.items[nextIndex];

    let output = this.formatKnowledgeItem(item, responseStyle.verbosity);
    
    // Add continuation prompt if more items available
    if (knowledgeResult.items.length > 1) {
      const remaining = knowledgeResult.items.length - nextIndex - 1;
      if (remaining > 0) {
        output += `\n\n(${remaining} more insight${remaining > 1 ? 's' : ''} available...)`;
      }
    }

    output += `\n\n${responseStyle.morePrompt}`;

    // Update context
    const newContext = {
      ...session.context,
      lastDomains: knowledgeResult.domains || [],
      knowledgeIds: knowledgeResult.items.map(i => i.knowledge_id),
      lastKnowledgeIndex: nextIndex,
      conversationTurns: (session.context.conversationTurns || 0) + 1
    };

    return {
      success: true,
      output,
      source: 'lore',
      knowledgeResult,
      context: newContext
    };
  }
}

export default new ClaudeBrain();
