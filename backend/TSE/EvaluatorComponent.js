import traitManager from "../traits/TraitManager.js";
import generateHexId from "../utils/hexIdGenerator.js";
import pool from "../db/pool.js";

export default class EvaluatorComponent {
  constructor(dbPool) {
    this.pool = dbPool;
  }

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

  async evaluateReview({ characterId, knowledgeId, grade }) {
    console.log("[FSRS PROBE] evaluateReview called", { characterId, knowledgeId, grade });
    if (!characterId || !knowledgeId || grade === undefined) {
      throw new Error("Missing required parameters for review");
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

  async evaluateTaskAttempt({ task, attempt, padSnapshot }) {

    if (!task || !attempt) {
      throw new Error("Missing task or attempt in evaluateTaskAttempt");
    }

    console.log(`[PhaseGate] Evaluating taskPhase=${task.taskPhase || "undefined"}, taskType=${task.taskType || task.task_type || "unknown"}, category=${task.taskCategory || "unknown"}`);

    // White Belt recall scoring (strict, term-based)
    if (task.taskType === "recall" && task.required_terms) {
      return this._scoreWhiteBeltRecall(attempt.attemptText, task.required_terms);
    }

    // Acquisition tasks (non-recall)
    const baseScore = 1;
    return { score: baseScore, phase: "acquisition", reason: "non_recall_acquisition" };

    // Fallback for unimplemented phases
    console.warn(`[EvalFallback] No specific handler for phase=${task.taskPhase || "unknown"} type=${task.taskType || "unknown"}`);
    return { score: 1, reason: "phase_not_implemented_yet" };
  }

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

      let effectiveness = 0;
      if (maxDistance > 0) {
        effectiveness = Math.max(0, 1 - (padDistance / maxDistance));
      } else {
        effectiveness = 1;
      }

      scores.effectiveness = effectiveness;
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

    if (attempt.attemptText.includes("pretty neat") || attempt.attemptText.includes("love to hear")) {
      scores.innovation += 0.3;
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

    const lengthRatio = orig.length > 0 ? text.length / orig.length : 1;

    if (taskType === 'sentence_clarity_rewrite') {
      if (lengthRatio < 0.9) {
        score += 1.5;
        reasons.push(`Reduced length: ${Math.round(lengthRatio * 100)}%`);
      }
      if (text.includes('. ')) {
        score += 1.0;
        reasons.push('Added sentence breaks');
      }
    }

    if (taskType === 'cause_effect_rewrite') {
      const connectors = (text.match(/because|so|therefore|as a result|→/gi) || []).length;
      console.log(`[Evaluator] Arrow check: has→=${text.includes('→')}, has->${text.includes('->')}, connectors=${connectors}`);
      console.log(`[Evaluator] Connectors found: ${connectors}, text sample: ${text.substring(0, 100)}`);
      score += Math.min(3, connectors * 0.8);
      reasons.push(`${connectors} causal connectors used`);
    }

    if (taskType === 'summarize_core_point') {
      if (lengthRatio < 0.6) {
        score += 2.0;
        reasons.push(`Summary brevity: ${Math.round(lengthRatio * 100)}%`);
      }
      const keyTerms = (text.match(/because|dragon|village|sacred|destroyed|therefore/gi) || []).length;
      if (keyTerms > 0) {
        score += 0.5;
        reasons.push(`${keyTerms} key terms retained`);
      }
    }

    console.log(`[CulturalDebug] targetIntent="${task.metadata?.target_outcome_intent}", usedIntent="${attempt.metadata?.outcome_intent}"`);
    const normalize = s => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
    const targetIntent = task.metadata?.target_outcome_intent || "explain warmly and clearly";
    const usedIntent = attempt.metadata?.outcome_intent || "explain warmly and clearly";
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
    };
  }

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

    const state = res.rows[0];
    state.grade_history = state.grade_history || [];
    return state;
  }

  _applyFSRS(state, grade) {
    const now = Date.now();
    const daysSince = state.last_review_timestamp
      ? (now - new Date(state.last_review_timestamp).getTime()) / 86400000
      : 0;

    const current_retrievability = Math.exp(-daysSince / state.stability);

    let difficulty = state.difficulty;
    let stability = state.stability;

    if (grade >= 3) {
      difficulty = Math.max(1.0, difficulty - 0.2);
      stability = stability + 0.15 + (4 - difficulty) * 0.02;
    } else {
      difficulty = Math.min(8.0, difficulty + 0.4);
      stability = Math.max(0.3, stability * 0.6);
    }

    difficulty = Math.max(1.0, Math.min(8.0, difficulty));
    stability = Math.max(0.3, stability);

    const next_review_timestamp = new Date(
      now + stability * 86400000
    ).toISOString();

    return {
      difficulty,
      stability,
      current_retrievability,
      last_review_timestamp: new Date(now).toISOString(),
      next_review_timestamp,
      grade_history: [...(state.grade_history || []), grade]
    };
  }
  async _persistState(characterId, knowledgeId, updatedState, grade) {
    try {
      const sql = `
        INSERT INTO character_knowledge_state (
          character_id, knowledge_id, difficulty, stability,
          current_retrievability, grade_history,
          last_review_timestamp, next_review_timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (character_id, knowledge_id)
        DO UPDATE SET
          difficulty = EXCLUDED.difficulty,
          stability = EXCLUDED.stability,
          current_retrievability = EXCLUDED.current_retrievability,
          grade_history = EXCLUDED.grade_history,
          last_review_timestamp = EXCLUDED.last_review_timestamp,
          next_review_timestamp = EXCLUDED.next_review_timestamp,
          practice_count = COALESCE(character_knowledge_state.practice_count, 0) + 1
      `;

      await this.pool.query(sql, [
        characterId,
        knowledgeId,
        updatedState.difficulty,
        updatedState.stability,
        updatedState.current_retrievability,
        JSON.stringify(updatedState.grade_history || []),
        updatedState.last_review_timestamp,
        updatedState.next_review_timestamp
      ]);

      console.log(`[Evaluator] Persisted FSRS state for ${characterId}/${knowledgeId}, grade=${grade}`);
      return { success: true };
    } catch (err) {
      console.error(`[Evaluator] _persistState failed for ${characterId}/${knowledgeId}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  async _applyTraitWeighting(characterId, baseScore) {
    const traits = await traitManager.getTraitVector(characterId);
    const diligence = traits["#0000C3"] || 50;
    const impulsive = traits["#0000A1"] || 50;
    let multiplier = 1.0;
    if (diligence > 60) multiplier += 0.1;
    if (impulsive > 70) multiplier -= 0.1;
    return Math.max(1, Math.min(5, Math.round(baseScore * multiplier)));
  }
  // PHASE 2 TASK 4 — score to FSRS grade mapping
  mapScoreToFSRSGrade(score) {
    const map = {
      1: "Again",
      2: "Hard",
      3: "Good",
      4: "Good",
      5: "Easy"
    };
    return map[Math.round(score)] || "Again";
  }

  // PHASE 2 TASK 6 — placeholder scoring handlers
  _scoreWhiteBeltRecall(studentAnswer, requiredTerms) {
    const text = (studentAnswer || "").toLowerCase();
    const matched = [];
    const missing = [];
    for (const term of (requiredTerms || [])) {
      if (text.includes(term.toLowerCase())) matched.push(term);
      else missing.push(term);
    }
    let score = 1;
    if (matched.length === 3) score = 5;
    else if (matched.length === 2) score = 3;
    console.log("[WhiteBeltRecall]", { matched_terms: matched, missing_terms: missing, score });
    return { score, matched_terms: matched, missing_terms: missing };
  }

  _scoreApplication(studentAnswer, scenario, task) {
    return studentAnswer.includes("apply") || studentAnswer.length > 80 ? 4 : 2;
  }

  _scoreReview(studentAnswer, previousContent, task) {
    return studentAnswer.includes("review") || studentAnswer.includes("understand") ? 4 : 3;
  }

  // PHASE 2 TASK 7 — static feedback templates
  static FEEDBACK_TEMPLATES = {
    recall: {
      process: [
        "You recalled the key fact quickly — good! The memory surfaced clearly, like water finding its path downhill.",
        "The answer was incomplete or inaccurate. Try breaking it into smaller parts next time. The answer scattered like leaves — gather them into one bundle before speaking.",
        "Recall felt rushed. Pause and visualize the information before answering. Sit with the question first — let it settle into the soil."
      ],
      selfReg: [
        "Next time, use active recall: cover the answer and try to retrieve it first. Close your eyes and reach inward before opening your mouth.",
        "Ask yourself: What is the one core idea here? What is the one root beneath all the branches?",
        "Rate your confidence before seeing the correct answer. Feel your certainty — is it solid ground or soft moss?"
      ]
    },
    application: {
      process: [
        "You applied the concept well to the scenario — strong reasoning! You wove the principle into the world skillfully — the threads held strong.",
        "The application missed a key condition/step. Re-read the scenario carefully. A thread broke in your weaving — go back and read the whole pattern again.",
        "Good attempt, but logic chain broke midway. Practice step-by-step breakdown. Your logic walked partway into the forest, then lost the trail — walk it step by step."
      ],
      selfReg: [
        "Before answering, list the relevant rules/principles first. Lay out all the stones you must step on — name them first.",
        "After each attempt, ask: Did I use all given information? Ask the wind: Did you use what was given to you?",
        "Try explaining your reasoning out loud next time. Speak your reasoning aloud to the stones — they do not lie."
      ]
    },
    review: {
      process: [
        "Solid reflection — you connected ideas across sessions. You saw across seasons, connecting what was scattered.",
        "Review stayed surface-level. Dig deeper into why something is true. Your reflection touched only the surface of the pool — dive deeper into the why.",
        "Good summary, but missed linking to earlier mistakes. You remembered the present, but forgot to look back at where you stumbled."
      ],
      selfReg: [
        "Use the why question at least twice in every review. Ask why at least twice — the answer deepens each time.",
        "Compare your current understanding to your first attempt. Hold your first attempt and your current understanding side by side — what changed?",
        "Write one question you still have after reviewing. Speak one question you still carry with you."
      ]
    }
  };

  // FSRS initial values - Evaluator is authoritative source
  static INITIAL_RETRIEVABILITY = 0.25; // Freshly acquired, needs reinforcement
  static INITIAL_STABILITY = 1.0;       // ~1 day before significant decay
  static INITIAL_DIFFICULTY = 5.0;      // Mid-range item difficulty
  static FIRST_REVIEW_DELAY_DAYS = 1;   // First review scheduled in 1 day

  /**
   * Initialize FSRS state for newly acquired knowledge item
   * Called after Student stores memory_trace
   * @param {string} characterId - Character hex ID
   * @param {string} knowledgeId - Knowledge item hex ID
   * @returns {Object} { success: boolean, error?: string }
   */
  async initializeNewItem(characterId, knowledgeId) {
    const delayDays = EvaluatorComponent.FIRST_REVIEW_DELAY_DAYS;

    try {
      const result = await this.pool.query(
        `UPDATE character_knowledge_state SET
           current_retrievability = $3,
           stability = $4,
           difficulty = $5,
           last_review_timestamp = NOW(),
           next_review_timestamp = NOW() + INTERVAL '1 day',
           grade_history = COALESCE(grade_history, '[]'),
           practice_count = COALESCE(practice_count, 0)
         WHERE character_id = $1 AND knowledge_id = $2`,
        [
          characterId,
          knowledgeId,
          EvaluatorComponent.INITIAL_RETRIEVABILITY,
          EvaluatorComponent.INITIAL_STABILITY,
          EvaluatorComponent.INITIAL_DIFFICULTY
        ]
      );

      if (result.rowCount === 0) {
        console.warn('[Evaluator] initializeNewItem: No row found for ' + characterId + '/' + knowledgeId);
        return { success: false, error: 'no_row_found' };
      }

      console.log('[Evaluator] Initialized FSRS state for ' + characterId + '/' + knowledgeId);
      return { success: true };
    } catch (err) {
      console.error('[Evaluator] initializeNewItem failed:', err.message);
      return { success: false, error: err.message };
    }
  }
}
