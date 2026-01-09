import generateHexId from "../utils/hexIdGenerator.js";
import pool from "../db/pool.js";

export default class EvaluatorComponent {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  async initialize() {
    return true;
  }

  async evaluateReview({ characterId, knowledgeId, grade }) {
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

  async evaluateTaskAttempt({ task, attempt }) {
    if (!task || !attempt) {
      throw new Error("Missing task or attempt");
    }

    const taskType = task.task_type || task.taskType || task.metadata?.task_type;

    if (!taskType) {
      throw new Error("Task missing task_type");
    }

    if (taskType === 'communication_quality') {
      return this.evaluateCommunicationQuality(task, attempt);
    }

    return {
      score: 1,
      forbiddenPhraseUsed: false,
      connectors: [],
      reason: "unsupported_task_type"
    };
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
      scores.effectiveness = Math.max(0, 1 - (padDistance / maxDistance));
    }

    const targetIntent = task.metadata?.target_outcome_intent;
    const usedIntent = attempt.metadata?.outcome_intent;
    scores.cultural = (targetIntent === usedIntent) ? 1.0 : 0.5;

    const targetVerbosity = task.metadata?.target_verbosity || 'moderate';
    const verbosityLimits = { brief: 150, moderate: 500, detailed: 1000 };
    const targetLength = verbosityLimits[targetVerbosity] || 500;
    const actualLength = attempt.attempt_text?.length || 0;
    scores.efficiency = Math.max(0, 1 - Math.abs(actualLength - targetLength) / targetLength);

    scores.innovation = attempt.metadata?.storyteller_meta?.usedStoryteller ? 1.0 : 0.7;

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
}
