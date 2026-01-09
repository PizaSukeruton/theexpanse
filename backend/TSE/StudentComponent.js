import traitManager from "../traits/TraitManager.js";
import generateHexId from "../utils/hexIdGenerator.js";
import pool from "../db/pool.js";
import MechanicalBrain_v2 from "./TanukiEngine/MechanicalBrain_v2.js";
import TriggerPhraseDetector from "./TanukiEngine/TriggerPhraseDetector.js";
import { TASK_CATEGORY_ACQUISITION } from "./constants/KnowledgeState.js";

export default class StudentComponent {
  constructor() {
    this.pool = pool;
    // Fix: traitManager is already an instance, so we don't use 'new'
    this.traits = traitManager;
    this.nodeId = Math.floor(Math.random() * 256).toString(16).toUpperCase();
  }

  async initialize() {
    return true;
  }

  async learn(characterId, knowledgeId, task) {
    const attemptId = await generateHexId("tse_attempt_id");

    let attemptText = "";
    let stored = false;

    // Check for Tanuki Mode trigger
    const detector = new TriggerPhraseDetector();
    const triggerResult = detector.detect(task.input);

    if (triggerResult.matched) {
      // Route to MechanicalBrain for Tanuki Mode
      const MechanicalBrain = new MechanicalBrain_v2();
      attemptText = await MechanicalBrain.generateResponse(
        triggerResult.cleanedInput,
        triggerResult.characterId
      );
    } else {
      // Use existing task-based logic
      switch (task.taskType) {
        case "cause_effect_rewrite":
          attemptText = this._attemptCauseEffectRewrite(task.input);
          break;
        case "sentence_clarity_rewrite":
          attemptText = this._attemptSentenceClarityRewrite(task.input);
          break;
        case "summarize_core_point":
          attemptText = this._attemptSummarizeCorePoint(task.input);
          break;
        case "communication_quality":
          attemptText = this._attemptCommunicationQuality(task.input, task);
          break;
        case "clarification":
          attemptText = this._attemptCommunicationQuality(task.input, task);
          break;
        case "recall":
          const recallResult = await this._attemptRecall(characterId, knowledgeId);
          attemptText = recallResult.attempt_text;
          break;
        case "acquisition":
          stored = await this._storeMemoryTrace(characterId, knowledgeId, task);
          if (stored) {
            attemptText = "Okay, I have learned about " + (task.concept || task.metadata?.concept || "this concept") + ".";
          } else {
            attemptText = "I have already learned this.";
          }
          break;
        default:
          attemptText = "I do not understand this task yet.";
          break;
      }
    }

    attemptText = await this._applyPersonalityErrors(characterId, attemptText);

    return {
      attemptId,
      taskId: task.taskId,
      characterId,
      knowledgeId,
      attemptText,
      studentNode: this.nodeId,
      metadata: { outcome_intent: task.metadata?.target_outcome_intent || "neutral", stored }
    };
  }

  _attemptCauseEffectRewrite(text) {
    if (!text || typeof text !== "string") return "No input provided.";
    let result = text.trim()
      .replace(/\s+and then\s+/gi, (match) => Math.random() > 0.5 ? ' → so ' : ' → therefore ')
      .replace(/\s+and\s+/gi, ', because ')
      .replace(/\.\s*$/, '. As a result...');
    return result;
  }

  _attemptSentenceClarityRewrite(text) {
    if (!text || typeof text !== "string") return "No input provided.";
    let result = text.trim()
      .replace(/\s+and\s+/gi, '. ')
      .replace(/\s*,\s*/g, '. ')
      .split('. ')
      .map(s => s.trim())
      .filter(s => s.length > 5)
      .join('. ');
    return result || text.trim();
  }

  _attemptSummarizeCorePoint(text) {
    if (!text || typeof text !== "string") return "No input provided.";
    const sentences = text.split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);
    if (sentences.length === 0) return text.trim();
    const take = Math.max(1, Math.ceil(sentences.length * 0.5));
    let summary = sentences.slice(0, take).join('. ');
    if (take < sentences.length) summary += '...';
    else if (!summary.endsWith('.')) summary += '.';
    return summary;
  }


  _attemptCommunicationQuality(text, task) {
    if (!text || typeof text !== "string") return "No input provided.";
    let result = text.trim()
      .replace(/^Explain /i, "Let me explain: ")
      .replace(/\s+are\s+/gi, " involve ")
      .replace(/\.\s*$/, ", and that's pretty neat!");
    result += " I'd love to hear what you think!";
    if (task?.metadata?.target_verbosity === 'moderate') {
      result += " We can explore this together in a balanced way!";
    }
    return result;
  }

  async _applyPersonalityErrors(characterId, text) {
    const traits = await this.traits.getTraitVector(characterId);
    let result = text;

    const impulsive = traits["#0000A1"] || 50;
    const forgetful = traits["#0000B2"] || 50;
    const detailOriented = traits["#0000C3"] || 50;
    const overconfident = traits["#0000D4"] || 50;

    if (impulsive > 70 && result.includes(".")) {
      const parts = result.split(".");
      if (parts.length > 1) parts.pop();
      result = parts.join(".") + ".";
    }

    if (forgetful > 65) {
      result = result.replace(/\b(because|so|therefore|as a result|which led to|which caused)\b/gi, "...");
    }

    // if (detailOriented > 60) {
    //   result += " (note: attention to details included)";
    // }

    if (overconfident > 75) {
      result = "I know this! " + result;
    }

    return result;
  }

  /**
   * Load character knowledge state for recall operations
   * @param {string} characterId - Character hex ID
   * @param {string} knowledgeId - Knowledge item hex ID
   * @returns {Object|null} Knowledge state with R, S, D, memory_trace or null
   */
  async _loadKnowledgeState(characterId, knowledgeId) {
    try {
      const result = await this.pool.query(
        `SELECT
           current_retrievability,
           stability,
           difficulty,
           memory_trace,
           grade_history,
           acquisition_completed,
           practice_count,
           last_review_timestamp
         FROM character_knowledge_state
         WHERE character_id = $1 AND knowledge_id = $2`,
        [characterId, knowledgeId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (err) {
      console.error("[StudentComponent] _loadKnowledgeState failed:", err.message);
      return null;
    }
  }

  /**
   * Compute trait-based modifier for recall probability
   * @param {string} characterId - Character hex ID
   * @returns {number} Modifier between 0.5 and 1.5
   */
  async _computeTraitModifier(characterId) {
    try {
      const traits = await this.traits.getTraitVector(characterId);
      if (!traits) return 1.0;

      // Memory-related traits (boost recall)
      const memory = parseFloat(traits["#00002A"]) || 75;        // Memory capacity
      const focus = parseFloat(traits["#00002B"]) || 75;         // Focus/attention
      const diligence = parseFloat(traits["#0000E0"]) || 75;     // Work ethic

      // Anxiety-related traits (reduce recall)
      const anxiety = parseFloat(traits["#000020"]) || 50;       // General anxiety
      const testAnxiety = parseFloat(traits["#000021"]) || 50;   // Performance anxiety

      // Confidence (reduces blank responses)
      const confidence = parseFloat(traits["#000030"]) || 75;    // Self-confidence

      // Compute modifier
      // Positive traits boost (normalized to ~1.0 at baseline 75)
      const positiveBoost = ((memory + focus + diligence) / 3) / 75;

      // Anxiety penalty (normalized: 50 baseline = no penalty)
      const anxietyPenalty = 1 - (((anxiety + testAnxiety) / 2) - 50) / 200;

      // Combined modifier clamped to 0.5 - 1.5 range
      const modifier = Math.max(0.5, Math.min(1.5, positiveBoost * anxietyPenalty));

      return modifier;
    } catch (err) {
      console.error("[StudentComponent] _computeTraitModifier failed:", err.message);
      return 1.0; // Neutral modifier on error
    }
  }

  /**
   * Fisher-Yates shuffle for unbiased randomization
   * @param {Array} arr - Array to shuffle
   * @returns {Array} Shuffled copy
   */
  _fisherYatesShuffle(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate degraded recall based on memory trace and retrievability
   * @param {Object} memoryTrace - Stored memory trace with terms
   * @param {number} pRecall - Recall probability (0-1)
   * @returns {Object} { attempt_text, confidence }
   */
  _generateDegradedRecall(memoryTrace, pRecall) {
    // Handle empty or invalid memory trace
    if (!memoryTrace?.terms?.length) {
      return {
        attempt_text: "I learned this but cannot recall the details right now.",
        confidence: 0
      };
    }

    const terms = [...memoryTrace.terms];
    const concept = memoryTrace.concept || "this concept";

    // High recall (>0.8): Return all terms
    if (pRecall > 0.8) {
      return {
        attempt_text: terms.join(", ") + ".",
        confidence: pRecall
      };
    }

    // Medium recall (0.5-0.8): Return partial terms with uncertainty
    if (pRecall > 0.5) {
      const shuffled = this._fisherYatesShuffle(terms);
      const keepCount = Math.ceil(terms.length * pRecall);
      const keptTerms = shuffled.slice(0, keepCount);
      const missing = terms.length - keepCount;
      let response = keptTerms.join(", ");
      if (missing > 0) {
        response += "... and " + (missing === 1 ? "something else" : "some other parts") + " I think?";
      }
      return {
        attempt_text: response,
        confidence: pRecall
      };
    }

    // Low recall (0.3-0.5): Vague memory with random term
    if (pRecall > 0.3) {
      const randomTerm = this._fisherYatesShuffle(terms)[0] || "something";
      return {
        attempt_text: "I remember " + randomTerm + "... but the rest is fuzzy.",
        confidence: pRecall
      };
    }

    // Very low recall (<0.3): Almost forgotten
    return {
      attempt_text: "I know I learned about " + concept + ", but I cannot recall the specifics.",
      confidence: pRecall
    };
  }

  /**
   * Attempt recall of knowledge item using FSRS state and traits
   * @param {string} characterId - Character hex ID
   * @param {string} knowledgeId - Knowledge item hex ID
   * @returns {Object} { attempt_text, confidence, recallSucceeded }
   */
  async _attemptRecall(characterId, knowledgeId) {
    // 1. Load knowledge state
    const state = await this._loadKnowledgeState(characterId, knowledgeId);

    if (!state) {
      return {
        attempt_text: "I have not learned this yet.",
        confidence: 0,
        recallSucceeded: false
      };
    }

    // 2. Get retrievability - prefer stored value, fallback to FSRS formula
    const now = Date.now();
    const lastReview = state.last_review_timestamp
      ? new Date(state.last_review_timestamp).getTime()
      : now;
    const daysSince = (now - lastReview) / 86400000;
    const stability = state.stability || 1.0; // FSRS typical initial: 1-3 days

    // Prefer stored retrievability, fallback to decay formula if missing/invalid
    const baseRetrievability =
      state.current_retrievability != null && !isNaN(state.current_retrievability)
        ? state.current_retrievability
        : Math.exp(-daysSince / stability);

    // 3. Apply trait modifier
    const traitMod = await this._computeTraitModifier(characterId);
    const pRecall = Math.max(0, Math.min(1, baseRetrievability * traitMod));

    // 4. Roll the dice
    const roll = Math.random();
    const recallSucceeded = roll < pRecall;

    // 5. Generate response based on recall success
    if (!recallSucceeded) {
      return {
        attempt_text: "I am trying to remember... but it is not coming to me right now.",
        confidence: pRecall,
        recallSucceeded: false
      };
    }

    // 6. Successful recall - generate potentially degraded response
    const degradedResult = this._generateDegradedRecall(state.memory_trace, pRecall);

    return {
      attempt_text: degradedResult.attempt_text,
      confidence: degradedResult.confidence,
      recallSucceeded: true
    };
  }

  /**
   * Store memory trace at acquisition time (Student owns memory, Evaluator owns FSRS)
   * @param {string} characterId - Character hex ID
   * @param {string} knowledgeId - Knowledge item hex ID
   * @param {Object} task - Task containing required_terms and teaching content
   * @returns {boolean} True if stored, false if already acquired
   */
  async _storeMemoryTrace(characterId, knowledgeId, task) {
    try {
      // Check if already acquired (guard against re-encoding)
      const existing = await this._loadKnowledgeState(characterId, knowledgeId);
      if (existing?.acquisition_completed === true) {
        return false; // Already learned, do not overwrite
      }

      // Build memory trace from task
      const memoryTrace = {
        terms: task.required_terms || [],
        concept: task.concept || task.metadata?.concept || "unknown",
        source: "teaching_statement",
        encoding_strength: 0.5, // Initial encoding; consider tying to task difficulty later
        timestamp: new Date().toISOString()
      };

      // Student ONLY writes memory_trace + acquisition flag
      // Evaluator will initialize FSRS values separately
      await this.pool.query(
        `INSERT INTO character_knowledge_state (
           character_id,
           knowledge_id,
           memory_trace,
           acquisition_completed
         ) VALUES ($1, $2, $3, true)
         ON CONFLICT (character_id, knowledge_id) DO UPDATE SET
           memory_trace = $3,
           acquisition_completed = true`,
        [characterId, knowledgeId, JSON.stringify(memoryTrace)]
      );

      return true;
    } catch (err) {
      console.error("[StudentComponent] _storeMemoryTrace failed:", err.message);
      return false;
    }
  }
}
