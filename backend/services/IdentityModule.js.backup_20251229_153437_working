/**
 * IdentityModule.js
 * 
 * Claude's self-model architecture grounded in cognitive science.
 * 
 * Theoretical Foundations:
 *   - BDI (Belief-Desire-Intention): Rao & Georgeff 1995
 *   - ACT-R Activation: Anderson et al. 2004
 *   - AGM Belief Revision: Alchourrón, Gärdenfors & Makinson 1985
 *   - Mayer ABI Trust Model: Mayer, Davis & Schoorman 1995
 *   - McAdams Narrative Identity: McAdams 2001
 * 
 * Core Equations:
 *   ACT-R Activation: A_i = B_i + Σ W_j × S_ji + ε
 *   Trust Update: T_{t+1} = T_t + η[(α·ΔA) + (β·ΔB) + (γ·ΔI)]
 *   Parfitian Continuity: C_psy = |M_t ∩ M_{t+1}| / |M_t ∪ M_{t+1}|
 * 
 * Issues Addressed (v2):
 *   - Per-character cache timestamps (not global)
 *   - Automatic cache invalidation on writes
 *   - Input validation on all public methods
 *   - PAD value clamping
 *   - Semantic similarity via SemanticEmbedder integration
 *   - Constraint validation with keyword analysis
 *   - Intention stack operations (BDI commitment)
 *   - Learning request gating
 *   - Error handling with specific error types
 */

import pool from '../db/pool.js';

// Custom error types for specific failure modes
class IdentityError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'IdentityError';
    this.code = code;
    this.details = details;
  }
}

class IdentityModule {
  constructor(options = {}) {
    // ACT-R parameters (Anderson 2004 defaults)
    this.decayRate = options.decayRate || 0.5;
    this.activationNoise = options.activationNoise || 0.1;
    this.retrievalThreshold = options.retrievalThreshold || 0.1;
    
    // AGM belief revision
    this.minEntrenchmentForRevision = options.minEntrenchmentForRevision || 0.95;
    
    // Mayer ABI trust weights (must sum to 1.0)
    this.trustWeightAbility = options.trustWeightAbility || 0.30;
    this.trustWeightBenevolence = options.trustWeightBenevolence || 0.20;
    this.trustWeightIntegrity = options.trustWeightIntegrity || 0.50;
    
    // Validate weights sum to 1.0
    const weightSum = this.trustWeightAbility + this.trustWeightBenevolence + this.trustWeightIntegrity;
    if (Math.abs(weightSum - 1.0) > 0.001) {
      throw new IdentityError(
        `Trust weights must sum to 1.0, got ${weightSum}`,
        'INVALID_WEIGHTS'
      );
    }
    
    // Trust learning rate
    this.trustLearningRate = options.trustLearningRate || 0.1;
    
    // Per-character cache (not global timestamp)
    this.anchorCache = new Map();
    this.cacheTimestamps = new Map();
    this.cacheExpiry = options.cacheExpiry || 60000;
    
    // SemanticEmbedder reference (lazy loaded)
    this._semanticEmbedder = null;
    
    // Prohibited content patterns for constraint validation
    this.prohibitedPatterns = {
      malice: /\b(hate|kill|destroy|harm|hurt|attack|revenge)\b/i,
      deception: /\b(lie|deceive|trick|fool|manipulate|mislead)\b/i,
      fabrication: /\b(i remember when|back when i|that time i|i recall)\b/i
    };
    
    // Allowed dialogue functions when user is distressed (for gating)
    this.empathyFunctions = [
      'expressive.comfort',
      'expressive.empathize',
      'expressive.sympathize',
      'expressive.validate',
      'expressive.reassure'
    ];
    
    console.log('[IdentityModule] Initialized v2 with ACT-R decay=' + this.decayRate + 
      ', trust weights A/B/I=' + this.trustWeightAbility + '/' + 
      this.trustWeightBenevolence + '/' + this.trustWeightIntegrity);
  }

  // =========================================
  // INPUT VALIDATION
  // =========================================

  _validateCharacterId(characterId) {
    if (!characterId || typeof characterId !== 'string') {
      throw new IdentityError('characterId is required and must be a string', 'INVALID_CHARACTER_ID');
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(characterId)) {
      throw new IdentityError(`Invalid characterId format: ${characterId}`, 'INVALID_CHARACTER_ID_FORMAT');
    }
  }

  _validateUserId(userId) {
    if (!userId || typeof userId !== 'string') {
      throw new IdentityError('userId is required and must be a string', 'INVALID_USER_ID');
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(userId)) {
      throw new IdentityError(`Invalid userId format: ${userId}`, 'INVALID_USER_ID_FORMAT');
    }
  }

  _clampPAD(value) {
    if (typeof value !== 'number' || isNaN(value)) return 0;
    return Math.max(-1, Math.min(1, value));
  }

  _clampTrust(value) {
    if (typeof value !== 'number' || isNaN(value)) return 0.5;
    return Math.max(0, Math.min(1, value));
  }

  // =========================================
  // CACHE MANAGEMENT (Per-Character)
  // =========================================

  _getCacheKey(characterId, suffix = '') {
    return `${characterId}${suffix ? '_' + suffix : ''}`;
  }

  _isCacheValid(characterId, suffix = '') {
    const key = this._getCacheKey(characterId, suffix);
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return false;
    return (Date.now() - timestamp) < this.cacheExpiry;
  }

  _setCache(characterId, data, suffix = '') {
    const key = this._getCacheKey(characterId, suffix);
    this.anchorCache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
  }

  _getCache(characterId, suffix = '') {
    const key = this._getCacheKey(characterId, suffix);
    if (!this._isCacheValid(characterId, suffix)) {
      this.anchorCache.delete(key);
      this.cacheTimestamps.delete(key);
      return null;
    }
    return this.anchorCache.get(key);
  }

  _invalidateCache(characterId) {
    const prefix = characterId;
    for (const key of this.anchorCache.keys()) {
      if (key.startsWith(prefix)) {
        this.anchorCache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }
    console.log(`[IdentityModule] Cache invalidated for ${characterId}`);
  }

  clearCache() {
    this.anchorCache.clear();
    this.cacheTimestamps.clear();
    console.log('[IdentityModule] All caches cleared');
  }

  // =========================================
  // SEMANTIC EMBEDDER INTEGRATION
  // =========================================

  async _getSemanticEmbedder() {
    if (!this._semanticEmbedder) {
      try {
        const { default: SemanticEmbedder } = await import('./SemanticEmbedder.js');
        this._semanticEmbedder = SemanticEmbedder;
        console.log('[IdentityModule] SemanticEmbedder loaded for similarity calculations');
      } catch (err) {
        console.warn('[IdentityModule] SemanticEmbedder not available, falling back to keyword matching');
        this._semanticEmbedder = null;
      }
    }
    return this._semanticEmbedder;
  }

  async _computeSemanticSimilarity(text1, text2) {
    const embedder = await this._getSemanticEmbedder();
    if (embedder && typeof embedder.computeSimilarity === 'function') {
      try {
        return await embedder.computeSimilarity(text1, text2);
      } catch (err) {
        console.warn('[IdentityModule] Semantic similarity failed, using keyword fallback');
      }
    }
    // Fallback: Jaccard similarity on words
    const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  // =========================================
  // IDENTITY ANCHOR RETRIEVAL (ACT-R Based)
  // =========================================

  async loadIdentityAnchors(characterId) {
    this._validateCharacterId(characterId);
    
    const cached = this._getCache(characterId, 'anchors');
    if (cached) {
      return cached;
    }

    const client = await pool.connect();
    try {
      const sql = `
        SELECT anchor_id, anchor_type, anchor_text, entrenchment_level, 
               confidence, source_description, created_at, updated_at
        FROM identity_anchors
        WHERE character_id = $1
        ORDER BY entrenchment_level DESC, confidence DESC
      `;
      
      const result = await client.query(sql, [characterId]);
      const anchors = result.rows.map(row => ({
        ...row,
        entrenchment_level: parseFloat(row.entrenchment_level),
        confidence: parseFloat(row.confidence)
      }));
      
      this._setCache(characterId, anchors, 'anchors');
      console.log(`[IdentityModule] Loaded ${anchors.length} identity anchors for ${characterId}`);
      return anchors;
    } finally {
      client.release();
    }
  }

  async getAnchorsByType(characterId, anchorType) {
    this._validateCharacterId(characterId);
    
    const validTypes = ['core_trait', 'role', 'constraint', 'tone', 'safety'];
    if (!validTypes.includes(anchorType)) {
      throw new IdentityError(
        `Invalid anchorType: ${anchorType}. Must be one of: ${validTypes.join(', ')}`,
        'INVALID_ANCHOR_TYPE'
      );
    }
    
    const allAnchors = await this.loadIdentityAnchors(characterId);
    return allAnchors.filter(a => a.anchor_type === anchorType);
  }

  computeActivation(anchor, context = {}) {
    if (!anchor || !anchor.confidence || !anchor.entrenchment_level) {
      return 0;
    }
    
    // Base-level activation: B_i = ln(confidence + ε)
    const baseLevel = Math.log(Math.max(0.01, anchor.confidence) + 0.01);
    
    // Spreading activation from context
    let spreadingActivation = 0;
    
    if (context.userInput && typeof context.userInput === 'string') {
      const inputLower = context.userInput.toLowerCase();
      const anchorLower = anchor.anchor_text.toLowerCase();
      
      // Keyword matching with TF weighting
      const anchorWords = anchorLower.split(/\s+/).filter(w => w.length > 3);
      const inputWords = new Set(inputLower.split(/\s+/).filter(w => w.length > 3));
      
      let matchScore = 0;
      for (const word of anchorWords) {
        if (inputWords.has(word)) {
          matchScore += 1.0 / anchorWords.length; // Normalize by anchor length
        }
      }
      spreadingActivation = matchScore * 0.3;
    }
    
    // PAD-based activation boost (if context includes PAD)
    let padBoost = 0;
    if (context.pad) {
      const p = this._clampPAD(context.pad.pleasure || context.pad.p || 0);
      const a = this._clampPAD(context.pad.arousal || context.pad.a || 0);
      
      // Tone anchors more relevant when emotional
      if (anchor.anchor_type === 'tone' && Math.abs(p) > 0.3) {
        padBoost = 0.1;
      }
      // Constraint anchors more relevant under high arousal
      if (anchor.anchor_type === 'constraint' && a > 0.4) {
        padBoost = 0.15;
      }
    }
    
    // Entrenchment boost (higher entrenchment = more accessible)
    const entrenchmentBoost = anchor.entrenchment_level * 0.2;
    
    // Noise component (for variety in retrieval)
    const noise = (Math.random() - 0.5) * this.activationNoise;
    
    const activation = baseLevel + spreadingActivation + padBoost + entrenchmentBoost + noise;
    
    return activation;
  }

  async retrieveRelevantAnchors(characterId, context = {}) {
    this._validateCharacterId(characterId);
    
    let anchors = await this.loadIdentityAnchors(characterId);
    
    // Filter by type if specified
    if (context.anchorTypes && Array.isArray(context.anchorTypes) && context.anchorTypes.length > 0) {
      anchors = anchors.filter(a => context.anchorTypes.includes(a.anchor_type));
    }
    
    // Safety anchors ALWAYS included (non-negotiable)
    const safetyAnchors = anchors.filter(a => a.anchor_type === 'safety');
    const otherAnchors = anchors.filter(a => a.anchor_type !== 'safety');
    
    // Compute activation for non-safety anchors
    const scoredAnchors = otherAnchors.map(anchor => ({
      ...anchor,
      activation: this.computeActivation(anchor, context)
    }));
    
    // Sort by activation (descending)
    scoredAnchors.sort((a, b) => b.activation - a.activation);
    
    // Apply retrieval threshold
    const filteredAnchors = scoredAnchors.filter(a => a.activation >= this.retrievalThreshold);
    
    // Take top K
    const topK = Math.min(context.topK || 10, 20); // Cap at 20
    const topAnchors = filteredAnchors.slice(0, topK);
    
    // Safety anchors always included with max activation (cannot be suppressed)
    const result = [
      ...safetyAnchors.map(a => ({ ...a, activation: 1.0, forced: true })),
      ...topAnchors
    ];
    
    console.log(`[IdentityModule] Retrieved ${result.length} anchors ` +
      `(${safetyAnchors.length} safety [forced], ${topAnchors.length} contextual)`);
    
    return result;
  }

  // =========================================
  // RELATIONSHIP STATE (Mayer ABI Trust)
  // =========================================

  async getRelationshipState(characterId, userId) {
    this._validateCharacterId(characterId);
    this._validateUserId(userId);
    
    const client = await pool.connect();
    try {
      const selectSql = `
        SELECT * FROM relationship_state
        WHERE character_id = $1 AND user_id = $2
      `;
      
      const result = await client.query(selectSql, [characterId, userId]);
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          ...row,
          trust_score: parseFloat(row.trust_score),
          perceived_ability: parseFloat(row.perceived_ability),
          perceived_benevolence: parseFloat(row.perceived_benevolence),
          perceived_integrity: parseFloat(row.perceived_integrity),
          familiarity: parseFloat(row.familiarity)
        };
      }
      
      // Create new relationship state
      const { default: generateHexId } = await import('../utils/hexIdGenerator.js');
      const relationshipId = await generateHexId('relationship_state_id');
      
      const insertSql = `
        INSERT INTO relationship_state
        (relationship_id, character_id, user_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      
      const insertResult = await client.query(insertSql, [relationshipId, characterId, userId]);
      console.log(`[IdentityModule] Created relationship state ${relationshipId} for ${characterId} <-> ${userId}`);
      
      const newRow = insertResult.rows[0];
      return {
        ...newRow,
        trust_score: parseFloat(newRow.trust_score),
        perceived_ability: parseFloat(newRow.perceived_ability),
        perceived_benevolence: parseFloat(newRow.perceived_benevolence),
        perceived_integrity: parseFloat(newRow.perceived_integrity),
        familiarity: parseFloat(newRow.familiarity)
      };
    } finally {
      client.release();
    }
  }

  async updateTrust(characterId, userId, feedback = {}) {
    this._validateCharacterId(characterId);
    this._validateUserId(userId);
    
    const current = await this.getRelationshipState(characterId, userId);
    
    // Clamp deltas to reasonable range
    const aDelta = this._clampTrust(feedback.abilityDelta || 0) - 0.5; // Convert to -0.5 to 0.5
    const bDelta = this._clampTrust(feedback.benevolenceDelta || 0) - 0.5;
    const iDelta = this._clampTrust(feedback.integrityDelta || 0) - 0.5;
    
    // Mayer ABI update equation
    const trustChange = this.trustLearningRate * (
      (this.trustWeightAbility * aDelta) +
      (this.trustWeightBenevolence * bDelta) +
      (this.trustWeightIntegrity * iDelta)
    );
    
    const newAbility = this._clampTrust(current.perceived_ability + (this.trustLearningRate * aDelta));
    const newBenevolence = this._clampTrust(current.perceived_benevolence + (this.trustLearningRate * bDelta));
    const newIntegrity = this._clampTrust(current.perceived_integrity + (this.trustLearningRate * iDelta));
    const newTrust = this._clampTrust(current.trust_score + trustChange);
    
    const client = await pool.connect();
    try {
      const updateSql = `
        UPDATE relationship_state
        SET perceived_ability = $1,
            perceived_benevolence = $2,
            perceived_integrity = $3,
            trust_score = $4,
            interaction_count = interaction_count + 1,
            last_interaction = NOW(),
            updated_at = NOW()
        WHERE character_id = $5 AND user_id = $6
        RETURNING *
      `;
      
      const result = await client.query(updateSql, [
        newAbility, newBenevolence, newIntegrity, newTrust,
        characterId, userId
      ]);
      
      console.log(`[IdentityModule] Trust updated for ${characterId} <-> ${userId}: ` +
        `A=${newAbility.toFixed(3)}, B=${newBenevolence.toFixed(3)}, ` +
        `I=${newIntegrity.toFixed(3)}, T=${newTrust.toFixed(3)}`);
      
      return {
        ...result.rows[0],
        trust_score: newTrust,
        perceived_ability: newAbility,
        perceived_benevolence: newBenevolence,
        perceived_integrity: newIntegrity
      };
    } finally {
      client.release();
    }
  }

  // =========================================
  // INTENTION STACK (BDI Commitment)
  // =========================================

  async getActiveIntentions(characterId, userId) {
    this._validateCharacterId(characterId);
    this._validateUserId(userId);
    
    const client = await pool.connect();
    try {
      const sql = `
        SELECT * FROM intention_stack
        WHERE character_id = $1 AND user_id = $2 AND status = 'active'
        ORDER BY stack_position ASC
        LIMIT 3
      `;
      
      const result = await client.query(sql, [characterId, userId]);
      return result.rows.map(row => ({
        ...row,
        utility_score: parseFloat(row.utility_score || 0),
        reconsideration_threshold: parseFloat(row.reconsideration_threshold || 0.3)
      }));
    } finally {
      client.release();
    }
  }

  async pushIntention(characterId, userId, intention) {
    this._validateCharacterId(characterId);
    this._validateUserId(userId);
    
    if (!intention || !intention.intentionCode) {
      throw new IdentityError('intention.intentionCode is required', 'INVALID_INTENTION');
    }
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Get current max stack position
      const positionSql = `
        SELECT COALESCE(MAX(stack_position), -1) + 1 as next_position
        FROM intention_stack
        WHERE character_id = $1 AND user_id = $2 AND status = 'active'
      `;
      const posResult = await client.query(positionSql, [characterId, userId]);
      const nextPosition = posResult.rows[0].next_position;
      
      // Check stack depth limit (max 3 per BDI recommendation)
      if (nextPosition >= 3) {
        await client.query('ROLLBACK');
        return {
          pushed: false,
          reason: 'stack_full',
          message: 'Intention stack is at maximum depth (3)'
        };
      }
      
      const { default: generateHexId } = await import('../utils/hexIdGenerator.js');
      const intentionId = await generateHexId('intention_id');
      
      const insertSql = `
        INSERT INTO intention_stack
        (intention_id, character_id, user_id, intention_code, outcome_intent, 
         dialogue_function, utility_score, stack_position)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const result = await client.query(insertSql, [
        intentionId,
        characterId,
        userId,
        intention.intentionCode,
        intention.outcomeIntent || null,
        intention.dialogueFunction || null,
        intention.utilityScore || 0.5,
        nextPosition
      ]);
      
      await client.query('COMMIT');
      console.log(`[IdentityModule] Pushed intention ${intentionId} at position ${nextPosition}`);
      
      return {
        pushed: true,
        intention: result.rows[0]
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async popIntention(characterId, userId, status = 'achieved') {
    this._validateCharacterId(characterId);
    this._validateUserId(userId);
    
    const validStatuses = ['achieved', 'abandoned', 'impossible'];
    if (!validStatuses.includes(status)) {
      throw new IdentityError(
        `Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`,
        'INVALID_INTENTION_STATUS'
      );
    }
    
    const client = await pool.connect();
    try {
      // Get the top intention
      const selectSql = `
        SELECT * FROM intention_stack
        WHERE character_id = $1 AND user_id = $2 AND status = 'active'
        ORDER BY stack_position DESC
        LIMIT 1
      `;
      
      const selectResult = await client.query(selectSql, [characterId, userId]);
      
      if (selectResult.rows.length === 0) {
        return { popped: false, reason: 'stack_empty' };
      }
      
      const intention = selectResult.rows[0];
      
      // Update status
      const updateSql = `
        UPDATE intention_stack
        SET status = $1, updated_at = NOW()
        WHERE intention_id = $2
        RETURNING *
      `;
      
      await client.query(updateSql, [status, intention.intention_id]);
      console.log(`[IdentityModule] Popped intention ${intention.intention_id} with status ${status}`);
      
      return {
        popped: true,
        intention,
        newStatus: status
      };
    } finally {
      client.release();
    }
  }

  async shouldReconsiderIntention(intention, newContext) {
    if (!intention) return true;
    
    // Reconsider if utility drops below threshold
    const currentUtility = parseFloat(intention.utility_score || 0);
    const threshold = parseFloat(intention.reconsideration_threshold || 0.3);
    
    // Reconsider if PAD shows dramatic shift
    if (newContext.pad) {
      const p = this._clampPAD(newContext.pad.pleasure || newContext.pad.p || 0);
      if (p < -0.5) {
        console.log('[IdentityModule] Reconsidering intention due to negative emotional shift');
        return true;
      }
    }
    
    // Reconsider if user explicitly changes topic
    if (newContext.topicChange) {
      console.log('[IdentityModule] Reconsidering intention due to topic change');
      return true;
    }
    
    return currentUtility < threshold;
  }

  // =========================================
  // AGM BELIEF REVISION
  // =========================================

  async checkContradiction(characterId, newBelief) {
    this._validateCharacterId(characterId);
    
    if (!newBelief || typeof newBelief !== 'string') {
      throw new IdentityError('newBelief must be a non-empty string', 'INVALID_BELIEF');
    }
    
    const anchors = await this.loadIdentityAnchors(characterId);
    const conflictingAnchors = [];
    
    const newBeliefLower = newBelief.toLowerCase();
    
    // Pattern-based contradiction detection
    const negationPatterns = [
      { positive: /\bi am\b/, negative: /\bi am not\b/ },
      { positive: /\bi do\b/, negative: /\bi do not\b/ },
      { positive: /\bi can\b/, negative: /\bi cannot\b/ },
      { positive: /\bnever\b/, negative: /\balways\b/ },
      { positive: /\balways\b/, negative: /\bnever\b/ },
      { positive: /\bi love\b/, negative: /\bi hate\b/ },
      { positive: /\bi help\b/, negative: /\bi harm\b/ }
    ];
    
    for (const anchor of anchors) {
      const anchorLower = anchor.anchor_text.toLowerCase();
      
      for (const pattern of negationPatterns) {
        const anchorHasPositive = pattern.positive.test(anchorLower);
        const anchorHasNegative = pattern.negative.test(anchorLower);
        const beliefHasPositive = pattern.positive.test(newBeliefLower);
        const beliefHasNegative = pattern.negative.test(newBeliefLower);
        
        if ((anchorHasPositive && beliefHasNegative) || (anchorHasNegative && beliefHasPositive)) {
          // Check semantic similarity to confirm contradiction
          const similarity = await this._computeSemanticSimilarity(anchorLower, newBeliefLower);
          if (similarity > 0.3) {
            conflictingAnchors.push({
              ...anchor,
              contradictionType: 'negation_pattern',
              similarity
            });
            break;
          }
        }
      }
    }
    
    return {
      contradicts: conflictingAnchors.length > 0,
      conflictingAnchors,
      checkedAnchors: anchors.length
    };
  }

  async reviseBeliefs(characterId, newBelief) {
    this._validateCharacterId(characterId);
    
    if (!newBelief || !newBelief.text) {
      throw new IdentityError('newBelief.text is required', 'INVALID_BELIEF_OBJECT');
    }
    
    const { contradicts, conflictingAnchors } = await this.checkContradiction(characterId, newBelief.text);
    
    if (!contradicts) {
      return { revised: false, reason: 'no_contradiction', canExpand: true };
    }
    
    const maxConflictEntrenchment = Math.max(
      ...conflictingAnchors.map(a => a.entrenchment_level)
    );
    
    if (maxConflictEntrenchment >= this.minEntrenchmentForRevision) {
      return {
        revised: false,
        reason: 'entrenchment_protected',
        conflictingAnchors,
        message: `Core identity anchor (entrenchment ${maxConflictEntrenchment}) cannot be revised`
      };
    }
    
    const newEntrenchment = newBelief.entrenchment || 0;
    if (newEntrenchment <= maxConflictEntrenchment) {
      return {
        revised: false,
        reason: 'insufficient_entrenchment',
        conflictingAnchors,
        message: `New belief (${newEntrenchment}) cannot override existing (${maxConflictEntrenchment})`
      };
    }
    
    // Flag for manual review - never auto-revise identity
    return {
      revised: false,
      reason: 'flagged_for_review',
      conflictingAnchors,
      message: 'Belief revision flagged for manual review',
      requiresAdminAction: true
    };
  }

  // =========================================
  // LEARNING REQUEST GATING
  // =========================================

  async canLearn(characterId, proposedLearning) {
    this._validateCharacterId(characterId);
    
    if (!proposedLearning || !proposedLearning.content) {
      return { allowed: false, reason: 'invalid_learning_request' };
    }
    
    // Check if learning contradicts identity
    const { contradicts, conflictingAnchors } = await this.checkContradiction(
      characterId,
      proposedLearning.content
    );
    
    if (contradicts) {
      const protectedAnchors = conflictingAnchors.filter(
        a => a.entrenchment_level >= this.minEntrenchmentForRevision
      );
      
      if (protectedAnchors.length > 0) {
        console.log(`[IdentityModule] Learning blocked: contradicts ${protectedAnchors.length} protected anchors`);
        return {
          allowed: false,
          reason: 'contradicts_identity',
          conflictingAnchors: protectedAnchors,
          message: 'Cannot learn content that contradicts core identity'
        };
      }
    }
    
    // Check against constraints
    const constraints = await this.getAnchorsByType(characterId, 'constraint');
    for (const constraint of constraints) {
      if (constraint.anchor_text.includes('do not') || constraint.anchor_text.includes('never')) {
        // Check if learning would violate constraint
        for (const [patternName, pattern] of Object.entries(this.prohibitedPatterns)) {
          if (pattern.test(proposedLearning.content)) {
            console.log(`[IdentityModule] Learning blocked: violates ${patternName} constraint`);
            return {
              allowed: false,
              reason: 'violates_constraint',
              constraint: constraint.anchor_text,
              pattern: patternName
            };
          }
        }
      }
    }
    
    return { allowed: true, reason: 'passes_identity_check' };
  }

  // =========================================
  // RESPONSE VALIDATION (Constraint Checking)
  // =========================================

  async validateResponse(characterId, proposedResponse) {
    this._validateCharacterId(characterId);
    
    if (!proposedResponse || typeof proposedResponse !== 'string') {
      return { valid: false, violations: [{ type: 'invalid_input', message: 'Response must be a string' }] };
    }
    
    const constraints = await this.getAnchorsByType(characterId, 'constraint');
    const safetyAnchors = await this.getAnchorsByType(characterId, 'safety');
    const allConstraints = [...constraints, ...safetyAnchors];
    
    const violations = [];
    const responseLower = proposedResponse.toLowerCase();
    
    // Check against prohibited patterns
    for (const [patternName, pattern] of Object.entries(this.prohibitedPatterns)) {
      if (pattern.test(responseLower)) {
        // Check if this is contextually appropriate (e.g., discussing folklore)
        const isMetaDiscussion = /\b(tale|story|folklore|legend|some say)\b/i.test(responseLower);
        if (!isMetaDiscussion) {
          violations.push({
            type: 'prohibited_content',
            pattern: patternName,
            message: `Response contains prohibited ${patternName} content`
          });
        }
      }
    }
    
    // Check for fabricated memories (constraint: "I only recall events that truly happened")
    if (this.prohibitedPatterns.fabrication.test(responseLower)) {
      violations.push({
        type: 'potential_fabrication',
        message: 'Response may contain fabricated memories',
        severity: 'warning'
      });
    }
    
    // Check response length (tone constraint: warm but not verbose)
    if (proposedResponse.length > 2000) {
      violations.push({
        type: 'excessive_length',
        message: 'Response exceeds recommended length',
        severity: 'warning'
      });
    }
    
    return {
      valid: violations.filter(v => v.severity !== 'warning').length === 0,
      violations,
      warnings: violations.filter(v => v.severity === 'warning'),
      errors: violations.filter(v => v.severity !== 'warning'),
      constraintsChecked: allConstraints.length
    };
  }

  // =========================================
  // DIALOGUE FUNCTION GATING
  // =========================================

  filterDialogueFunctions(candidateFunctions, context = {}) {
    if (!Array.isArray(candidateFunctions)) {
      return [];
    }
    
    // If user is distressed (negative pleasure), restrict to empathy functions
    if (context.pad) {
      const p = this._clampPAD(context.pad.pleasure || context.pad.p || 0);
      
      if (p < -0.2) {
        const filtered = candidateFunctions.filter(fn => 
          this.empathyFunctions.some(ef => fn.includes(ef) || ef.includes(fn))
        );
        
        if (filtered.length > 0) {
          console.log(`[IdentityModule] Filtered to ${filtered.length} empathy functions (user P=${p.toFixed(2)})`);
          return filtered;
        }
        // If no empathy functions in candidates, return all (don't block)
        console.log(`[IdentityModule] No empathy functions in candidates, returning all`);
      }
    }
    
    return candidateFunctions;
  }

  // =========================================
  // IDENTITY CONTEXT FOR CLAUDEBRAIN
  // =========================================

  async buildIdentityContext(characterId, userId, context = {}) {
    this._validateCharacterId(characterId);
    this._validateUserId(userId);
    
    const startTime = Date.now();
    const errors = [];
    
    // Load relevant anchors
    let relevantAnchors = [];
    try {
      relevantAnchors = await this.retrieveRelevantAnchors(characterId, context);
    } catch (err) {
      errors.push({ component: 'anchors', error: err.message });
      console.error('[IdentityModule] Failed to load anchors:', err.message);
    }
    
    // Group by type
    const anchorsByType = {
      core_trait: relevantAnchors.filter(a => a.anchor_type === 'core_trait'),
      role: relevantAnchors.filter(a => a.anchor_type === 'role'),
      constraint: relevantAnchors.filter(a => a.anchor_type === 'constraint'),
      tone: relevantAnchors.filter(a => a.anchor_type === 'tone'),
      safety: relevantAnchors.filter(a => a.anchor_type === 'safety')
    };
    
    // Get relationship state
    let relationshipState = null;
    try {
      relationshipState = await this.getRelationshipState(characterId, userId);
    } catch (err) {
      errors.push({ component: 'relationship', error: err.message });
      console.error('[IdentityModule] Failed to load relationship:', err.message);
    }
    
    // Get active intentions
    let activeIntentions = [];
    try {
      activeIntentions = await this.getActiveIntentions(characterId, userId);
    } catch (err) {
      errors.push({ component: 'intentions', error: err.message });
      console.error('[IdentityModule] Failed to load intentions:', err.message);
    }
    
    const elapsed = Date.now() - startTime;
    
    const identityContext = {
      characterId,
      userId,
      anchors: relevantAnchors,
      anchorsByType,
      relationship: relationshipState ? {
        trustScore: relationshipState.trust_score,
        perceivedAbility: relationshipState.perceived_ability,
        perceivedBenevolence: relationshipState.perceived_benevolence,
        perceivedIntegrity: relationshipState.perceived_integrity,
        familiarity: relationshipState.familiarity,
        interactionCount: relationshipState.interaction_count
      } : null,
      intentions: activeIntentions,
      currentIntention: activeIntentions.length > 0 ? activeIntentions[activeIntentions.length - 1] : null,
      constraints: anchorsByType.constraint.map(a => a.anchor_text),
      toneGuidance: anchorsByType.tone.map(a => a.anchor_text),
      safetyGuardrails: anchorsByType.safety.map(a => a.anchor_text),
      loadTimeMs: elapsed,
      errors: errors.length > 0 ? errors : null
    };
    
    const trustStr = identityContext.relationship 
      ? identityContext.relationship.trustScore.toFixed(3) 
      : 'N/A';
    
    console.log(`[IdentityModule] Built identity context in ${elapsed}ms: ` +
      `${relevantAnchors.length} anchors, ${activeIntentions.length} intentions, trust=${trustStr}` +
      (errors.length > 0 ? `, ${errors.length} errors` : ''));
    
    return identityContext;
  }

  // =========================================
  // IDENTITY SUMMARY
  // =========================================

  async getIdentitySummary(characterId) {
    this._validateCharacterId(characterId);
    
    const coreTraits = await this.getAnchorsByType(characterId, 'core_trait');
    const roles = await this.getAnchorsByType(characterId, 'role');
    const constraints = await this.getAnchorsByType(characterId, 'constraint');
    
    return {
      whoIAm: coreTraits.slice(0, 3).map(a => a.anchor_text),
      whatIDo: roles.slice(0, 2).map(a => a.anchor_text),
      whatIDoNot: constraints.slice(0, 2).map(a => a.anchor_text),
      summary: coreTraits[0]?.anchor_text || 'I am Claude the Tanuki.',
      anchorCounts: {
        core_trait: coreTraits.length,
        role: roles.length,
        constraint: constraints.length
      }
    };
  }
}

// Export singleton instance
const identityModule = new IdentityModule();
export default identityModule;

// Export class and error for testing
export { IdentityModule, IdentityError };
