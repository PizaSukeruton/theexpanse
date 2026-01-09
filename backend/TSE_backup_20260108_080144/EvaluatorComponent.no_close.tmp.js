import traitManager from "../traits/TraitManager.js";
import generateHexId from "../utils/hexIdGenerator.js";
import pool from "../db/pool.js";

export default class EvaluatorComponent {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

  // --- Stage 5: taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    return this.evaluateTaskAttempt({ task, attempt, padSnapshot });
  }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }


  async initialize() {
    return true;
  }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

  // --- Stage 5: taskCategory routing stub ---

  async evaluateReview({ characterId, knowledgeId, grade }) {
    if (!characterId || !knowledgeId || grade === undefined) {
      throw new Error("Missing required parameters for review");
    }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }


    const state = await this._loadState(characterId, knowledgeId);
    const updatedState = this._applyFSRS(state, grade);
    await this._persistState(characterId, knowledgeId, updatedState, grade);

    return {
      success: true,
      nextReview: updatedState.next_review_timestamp,
      updatedState
    };
  }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

  // --- Stage 5: taskCategory routing stub ---

  async evaluateTaskAttempt({ task, attempt, padSnapshot }) {
    console.log(`[TaskDebug] Full task object:`, JSON.stringify(task, null, 2));
    if (!task || !attempt) {

    // --- Phase-aware scoring gate (ACQUISITION) ---
    if (task.taskPhase === "acquisition") {
      const covered = attempt.attemptText && attempt.attemptText.length > 20;
      return {
        score: covered ? 3 : 1,
        phase: "acquisition"
      };
    }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

      throw new Error("Missing task or attempt");
    }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }


    const taskType = task.task_type || task.taskType || task.metadata?.task_type;

    if (!taskType) {
      throw new Error("Task missing task_type");
    }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }


    if (taskType === 'communication_quality' || taskType === 'clarification') {
      return this.evaluateCommunicationQuality(task, attempt);
    }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }


    if (['cause_effect_rewrite', 'sentence_clarity_rewrite', 'summarize_core_point', 'clarification'].includes(taskType)) {
      return this.evaluateRewriteTask(taskType, task, attempt);
    }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }


    if (['cause_effect_rewrite', 'sentence_clarity_rewrite', 'summarize_core_point', 'clarification'].includes(taskType)) {
      return this.evaluateRewriteTask(taskType, task, attempt);
    }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }


    return {
      score: 1,
      forbiddenPhraseUsed: false,
      connectors: [],
      reason: "unsupported_task_type"
    };
  }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

  // --- Stage 5: taskCategory routing stub ---

  evaluateCommunicationQuality(task, attempt) {
    const scores = {
      effectiveness: 0,
      efficiency: 0,
      cultural: 0,
      innovation: 0
    };

    const targetPad = task.metadata?.target_pad;
    const usedPad = attempt.metadata?.pad_used;

    if (targetPad && usedPad) {
      const deltaP = targetPad.p - usedPad.pleasure;
      const deltaA = targetPad.a - usedPad.arousal;
      const deltaD = targetPad.d - usedPad.dominance;
      
      const padDistance = Math.sqrt(deltaP * deltaP + deltaA * deltaA + deltaD * deltaD);
      const maxDistance = 2 * Math.sqrt(3);
      scores.effectiveness = Math.max(0, 1 - (padDistance / maxDistance));
    }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }


    const targetIntent = task.metadata?.target_outcome_intent;
    const usedIntent = attempt.metadata?.outcome_intent;
    scores.cultural = (targetIntent === usedIntent) ? 1.0 : 0.5;

    const targetVerbosity = task.metadata?.target_verbosity || 'moderate';
    const verbosityLimits = { brief: 150, moderate: 500, detailed: 1000 };
    const targetLength = verbosityLimits[targetVerbosity] || 500;
    const actualLength = attempt.attemptText?.length || 0;
    scores.efficiency = Math.max(0, 1 - Math.abs(actualLength - targetLength) / targetLength);

    scores.innovation = attempt.metadata?.storyteller_meta?.usedStoryteller ? 1.0 : 0.7;

    
    // Warmth bonus
    if (attempt.attemptText.includes("pretty neat") || attempt.attemptText.includes("love to hear")) {
      scores.innovation += 0.3;
    }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

    
    // Verbosity bonus
    const textLen = attempt.attemptText?.length || 0;
    if (textLen > 50) {
      scores.efficiency += 0.5;
    }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }


    const overallScore = (
      scores.effectiveness * 0.4 +
      scores.efficiency * 0.2 +
      scores.cultural * 0.2 +
      scores.innovation * 0.2
    );

    const mappedScore = Math.ceil(overallScore * 5);

    return {
      score: Math.max(1, Math.min(5, mappedScore)),
      forbiddenPhraseUsed: false,
      connectors: [],
      communicationScores: scores
    };
  }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

  // --- Stage 5: taskCategory routing stub ---


  evaluateRewriteTask(taskType, task, attempt) {
    console.log(`[EvalRewrite] taskType=${taskType}, attemptText="${attempt.attemptText}", length=${attempt.attemptText?.length}`);
    const text = attempt.attemptText || '';
    const orig = task.input || '';
    let score = 2;
    let reasons = [];

    if (text.includes("pretty neat") || text.includes("love to hear")) {
      score += 0.5;
      reasons.push("Warm/friendly tone detected");
    }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

    const lengthRatio = orig.length > 0 ? text.length / orig.length : 1;

    if (taskType === 'sentence_clarity_rewrite') {
      if (lengthRatio < 0.9) {
        score += 1.5;
        reasons.push(`Reduced length: ${Math.round(lengthRatio * 100)}%`);
      }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

      if (text.includes('. ')) {
        score += 1.0;
        reasons.push('Added sentence breaks');
      }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

    }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }


    if (taskType === 'cause_effect_rewrite') {
      const connectors = (text.match(/because|so|therefore|as a result|→/gi) || []).length;
    console.log(`[Evaluator] Arrow check: has→=${text.includes('→')}, has->${text.includes('->')}, connectors=${connectors}`);
    console.log(`[Evaluator] Connectors found: ${connectors}, text sample: ${text.substring(0, 100)}`);
      score += Math.min(3, connectors * 0.8);
      reasons.push(`${connectors} causal connectors used`);
    }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }


    if (taskType === 'summarize_core_point') {
      if (lengthRatio < 0.6) {
        score += 2.0;
        reasons.push(`Summary brevity: ${Math.round(lengthRatio * 100)}%`);
      }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

      const keyTerms = (text.match(/because|dragon|village|sacred|destroyed|therefore/gi) || []).length;
      if (keyTerms > 0) {
        score += 0.5;
        reasons.push(`${keyTerms} key terms retained`);
      }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

    }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }



    // Cultural score from intent match (shared logic with communication_quality)
    console.log(`[CulturalDebug] targetIntent="${task.metadata?.target_outcome_intent}", usedIntent="${attempt.metadata?.outcome_intent}"`);
    const normalize = s => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
    const targetIntent = task.metadata?.target_outcome_intent || "explain warmly and clearly";
    const usedIntent   = attempt.metadata?.outcome_intent   || "explain warmly and clearly";
    const cultural = normalize(targetIntent) === normalize(usedIntent) ? 1.0 : 0.5;
    return {
      score: Math.round(Math.max(1, Math.min(5, score))),
      reason: reasons.join('; ') || 'Rewrite evaluated',
      lengthRatio: Math.round(lengthRatio * 100),
      connectors: (text.match(/because|so|therefore|→/gi) || []).length,
      communicationScores: {
        cultural,
        effectiveness: score / 5,
        efficiency: task.metadata?.originalLength
          ? Math.max(0, Math.min(1, 1 - text.length / task.metadata.originalLength))
          : 0.5
      }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

    };
  }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

  // --- Stage 5: taskCategory routing stub ---

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
        grade_history: []
      };
    }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }


    const state = res.rows[0];
    state.grade_history = state.grade_history || [];
    return state;
  }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

  // --- Stage 5: taskCategory routing stub ---

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

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }


    const nextReviewDays = stability * retrievability * 2.5;
    const nextReviewTimestamp = new Date(
      now + nextReviewDays * 86400000
    ).toISOString();

    return {
      difficulty,
      stability,
      current_retrievability: retrievability,
      last_review_timestamp: new Date(now).toISOString(),
      next_review_timestamp: nextReviewTimestamp,
      grade_history: [...state.grade_history, { t: now, g: grade }]
    };
  }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

  // --- Stage 5: taskCategory routing stub ---

  async _persistState(characterId, knowledgeId, updatedState, grade) {
    const reviewId = await generateHexId("tse_review_log_id");

    await this.pool.query(
      `INSERT INTO knowledge_review_logs
       (log_id, character_id, knowledge_id, review_timestamp, grade)
       VALUES ($1, $2, $3, NOW(), $4)`,
      [reviewId, characterId, knowledgeId, grade]
    );

    await this.pool.query(
      `INSERT INTO character_knowledge_state
       (character_id, knowledge_id, difficulty, stability,
        current_retrievability, grade_history,
        last_review_timestamp, next_review_timestamp)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (character_id, knowledge_id)
       DO UPDATE SET difficulty = EXCLUDED.difficulty,
                     stability = EXCLUDED.stability,
                     current_retrievability = EXCLUDED.current_retrievability,
                     grade_history = EXCLUDED.grade_history,
                     last_review_timestamp = EXCLUDED.last_review_timestamp,
                     next_review_timestamp = EXCLUDED.next_review_timestamp`,
      [
        characterId,
        knowledgeId,
        updatedState.difficulty,
        updatedState.stability,
        updatedState.current_retrievability,
        JSON.stringify(updatedState.grade_history),
        updatedState.last_review_timestamp,
        updatedState.next_review_timestamp
      ]
    );
  }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

  // --- Stage 5: taskCategory routing stub ---
  // --- Trait-weighted score modulation ---
  async _applyTraitWeighting(characterId, baseScore) {
    const traits = await this.traits.getTraitVector(characterId);
    const diligence = traits["#0000C3"] || 50;
    const impulsive = traits["#0000A1"] || 50;
    let multiplier = 1.0;
    if (diligence > 60) multiplier += 0.1;
    if (impulsive > 70) multiplier -= 0.1;
    return Math.max(1, Math.min(5, Math.round(baseScore * multiplier)));
  }

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }

}

  // --- Stage 5: full taskCategory routing stub ---
  async handleTaskByCategory({ task, attempt, padSnapshot }) {
    const category = task.taskCategory || "unknown";
    console.log(`[CategoryRouter] Routing category=${category}, phase=${task.taskPhase || "n/a"}, type=${task.taskType || task.task_type || "n/a"}`);

    switch (category) {
      case "acquisition":
        return this.evaluateTaskAttempt({ task, attempt, padSnapshot });

      case "communication_quality":
        return this.evaluateCommunicationQuality(task, attempt);

      case "rewrite":
      case "clarity":
      case "summary":
        return this.evaluateRewriteTask(task.taskType || task.task_type, task, attempt);

      default:
        console.warn(`[CategoryRouter] No handler for category=${category}`);
        return { score: 1, reason: "category_not_implemented_yet", category };
    }
  }
