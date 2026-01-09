// EvaluatorComponent.js – fixed _generateFeedback + case-insensitive categories
// - Restored clean _generateFeedback (no broken markdown links)
// - Fallback score 3.5 to prevent instant failure
// - Case-insensitive category matching
// - Debug logging for category & score

import traitManager from "../traits/TraitManager.js";
import generateHexId from "../utils/hexIdGenerator.js";
import pool from "../db/pool.js";

export default class EvaluatorComponent {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  async initialize() {
    return true;
  }

  async handleTaskByCategory({ task, attempt, studentRecordId, userInput }) {
    const rawCategory = task.taskCategory || "unknown";
    const category = rawCategory.toLowerCase();
    const characterId = task.characterId || attempt.characterId || null;

    console.log(`[Evaluator] Evaluating - category="${rawCategory}" (normalized="${category}"), type="${task.taskType || 'n/a'}"`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, characterId });

      case "communication_quality":
      case "communication":
      case "reflection":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[Evaluator] No handler for category="${rawCategory}"`);
        return { 
          score: 3.5, 
          reason: "category_not_implemented", 
          category: rawCategory 
        };
    }
  }

  async evaluateReview({ characterId, knowledgeId, grade }) {
    if (!characterId || !knowledgeId || grade == null) {
      throw new Error("Missing required params for FSRS review");
    }

    const state = await this._loadState(characterId, knowledgeId);
    const updatedState = this._applyFSRS(state, grade);
    await this._persistState(characterId, knowledgeId, updatedState, grade);

    return {
      success: true,
      nextReview: updatedState.next_review_timestamp,
      updatedState,
    };
  }

  async evaluateTaskAttempt({ task, attempt, characterId }) {
    if (!task || !attempt) {
      throw new Error("Missing task or attempt");
    }

    if (task.taskPhase === "acquisition") {
      const covered = attempt.attemptText?.trim().length > 20 ?? false;
      let baseScore = covered ? 3 : 1;

      if (characterId) {
        try {
          baseScore = await this._applyTraitWeighting(characterId, baseScore);
        } catch (err) {
          console.error("[Evaluator] Trait weighting failed:", err.message);
        }
      }

      return {
        score: Math.max(1, Math.min(5, baseScore)),
        reason: covered ? "sufficient_coverage" : "response_too_short",
        phase: "acquisition",
      };
    }

    return { score: 3.5, reason: "phase_not_handled" };
  }

  evaluateCommunicationQuality(task, attempt) {
    const scores = {
      effectiveness: 0.5,
      efficiency: 0.5,
      cultural: 0.5,
      innovation: 0.5,
    };

    const targetPad = task.metadata?.target_pad;
    const usedPad = attempt.metadata?.pad_used;
    if (targetPad && usedPad) {
      const deltaP = targetPad.p - usedPad.pleasure;
      const deltaA = targetPad.a - usedPad.arousal;
      const deltaD = targetPad.d - usedPad.dominance;
      const padDistance = Math.sqrt(deltaP ** 2 + deltaA ** 2 + deltaD ** 2);
      const maxDistance = 2 * Math.sqrt(3);

      scores.effectiveness = maxDistance > 0
        ? Math.max(0, 1 - padDistance / maxDistance)
        : 1;
    }

    const targetIntent = (task.metadata?.target_outcome_intent || "").trim().toLowerCase();
    const usedIntent = (attempt.metadata?.outcome_intent || "").trim().toLowerCase();
    scores.cultural = targetIntent === usedIntent ? 1.0 : 0.5;

    const targetVerbosity = task.metadata?.target_verbosity || "moderate";
    const verbosityLimits = { brief: 150, moderate: 500, detailed: 1000 };
    const targetLength = verbosityLimits[targetVerbosity] || 500;
    const actualLength = attempt.attemptText?.length || 0;
    scores.efficiency = Math.max(0, 1 - Math.abs(actualLength - targetLength) / targetLength);

    scores.innovation = attempt.metadata?.storyteller_meta?.usedStoryteller ? 1.0 : 0.7;
    if (attempt.attemptText?.includes("pretty neat") || attempt.attemptText?.includes("love to hear")) {
      scores.innovation = Math.min(1, scores.innovation + 0.3);
    }

    const overall = (
      scores.effectiveness * 0.4 +
      scores.efficiency * 0.2 +
      scores.cultural * 0.2 +
      scores.innovation * 0.2
    );

    const score = Math.ceil(overall * 5);
    return {
      score: Math.max(1, Math.min(5, score)),
      communicationScores: scores,
      feedback: this._generateFeedback("communication_quality", score, attempt.attemptText || ""),
    };
  }

  evaluateRewriteTask(taskType, task, attempt) {
    const text = attempt.attemptText?.trim() || "";
    const orig = task.input?.trim() || "";
    let score = 2;
    const reasons = [];

    const lengthRatio = orig.length > 0 ? text.length / orig.length : 1;

    if (text.includes("pretty neat") || text.includes("love to hear")) {
      score += 0.5;
      reasons.push("warm/friendly tone detected");
    }

    if (taskType === "sentence_clarity_rewrite") {
      if (lengthRatio < 0.9) {
        score += 1.5;
        reasons.push(`reduced length: ${Math.round(lengthRatio * 100)}%`);
      }
      if (text.includes(". ")) {
        score += 1.0;
        reasons.push("added sentence breaks");
      }
    }

    if (taskType === "cause_effect_rewrite") {
      const connectors = (text.match(/because|so|therefore|as a result|→|->/gi) || []).length;
      score += Math.min(3, connectors * 0.8);
      reasons.push(`${connectors} causal connectors`);
    }

    if (taskType === "summarize_core_point") {
      if (lengthRatio < 0.6) {
        score += 2.0;
        reasons.push(`brevity: ${Math.round(lengthRatio * 100)}%`);
      }
    }

    const targetIntent = (task.metadata?.target_outcome_intent || "").toLowerCase().trim();
    const usedIntent = (attempt.metadata?.outcome_intent || "").toLowerCase().trim();
    const cultural = targetIntent === usedIntent ? 1.0 : 0.5;

    return {
      score: Math.round(Math.max(1, Math.min(5, score))),
      reason: reasons.join("; ") || "rewrite evaluated",
      communicationScores: {
        cultural,
        effectiveness: score / 5,
        efficiency: orig.length > 0 ? Math.max(0, 1 - lengthRatio) : 0.5,
      },
      feedback: this._generateFeedback(taskType, score, text),
    };
  }

  // FSRS Helpers
  async _loadState(characterId, knowledgeId) {
    const res = await this.pool.query(
      `SELECT difficulty, stability, current_retrievability,
              last_review_timestamp, next_review_timestamp, grade_history
       FROM character_knowledge_state
       WHERE character_id = $1 AND knowledge_id = $2`,
      [characterId, knowledgeId]
    );

    if (res.rows.length === 0) {
      return {
        difficulty: 3.5,
        stability: 0.6,
        current_retrievability: 1.0,
        last_review_timestamp: null,
        next_review_timestamp: null,
        grade_history: [],
      };
    }

    const state = res.rows[0];
    state.grade_history = state.grade_history || [];
    return state;
  }

  _applyFSRS(state, grade) {
    const now = Date.now();
    const daysSince = state.last_review_timestamp
      ? (now - new Date(state.last_review_timestamp).getTime()) / 86400000
      : 0;

    const retrievability = Math.exp(-daysSince / state.stability);

    let difficulty = state.difficulty;
    let stability = state.stability;

    if (grade >= 3) {
      difficulty = Math.max(1.0, difficulty - 0.2);
      stability = stability + 0.15 + (4 - difficulty) * 0.02;
    } else {
      difficulty = Math.min(8.0, difficulty + 0.4);
      stability = Math.max(0.3, stability * 0.6);
    }

    const nextReviewDays = stability * retrievability * 2.5;
    const nextReviewTimestamp = new Date(now + nextReviewDays * 86400000).toISOString();

    return {
      difficulty,
      stability,
      current_retrievability: retrievability,
      last_review_timestamp: new Date(now).toISOString(),
      next_review_timestamp: nextReviewTimestamp,
      grade_history: [...state.grade_history, { t: now, g: grade }],
    };
  }

  // Keep your other FSRS methods (_persistState, _applyTraitWeighting, mapScoreToFSRSGrade)

  _generateFeedback(taskType, score, attemptText) {
    const templates = EvaluatorComponent.FEEDBACK_TEMPLATES?.[taskType] || {};
    const processTemplates = templates.process || [];
    const index = Math.min(Math.max(0, 5 - Math.round(score)), processTemplates.length - 1);
    return processTemplates[index] || "Good effort — keep practicing.";
  }

  static FEEDBACK_TEMPLATES = {
    recall: {
      process: [
        "You recalled the key fact quickly — good! The memory surfaced clearly.",
        "The answer was incomplete or inaccurate. Try breaking it into smaller parts.",
        "Recall felt rushed. Pause and visualize before answering.",
      ],
    },
    communication_quality: {
      process: [
        "Your explanation was clear and warm — excellent! It felt like a friendly conversation.",
        "Good effort, but could be warmer. Add a personal touch or example next time.",
        "Clear, but a bit formal. Try more empathy or storytelling to make it warmer.",
      ],
    },
    // Add more as needed
  };
}
