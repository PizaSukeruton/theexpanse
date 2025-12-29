import generateHexId from "../utils/hexIdGenerator.js";

/**
 * EvaluatorComponent v1 (FSRS Engine)
 * - Deterministic
 * - Trait-modified
 * - Hex-safe
 * - Zero external dependencies
 */

export default class EvaluatorComponent {
  constructor(pool) {
    this.pool = pool;
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
      nextReview: updatedState.nextreviewtimestamp,
      updatedState
    };
  }

  async _loadState(characterId, knowledgeId) {
    const res = await this.pool.query(
      `SELECT difficulty, stability, currentretrievability,
              lastreviewtimestamp, nextreviewtimestamp, gradehistory
       FROM character_knowledge_state
       WHERE characterid = $1 AND knowledgeid = $2`,
      [characterId, knowledgeId]
    );

    if (res.rows.length === 0) {
      return {
        difficulty: 3.5,
        stability: 0.6,
        currentretrievability: 1.0,
        lastreviewtimestamp: null,
        nextreviewtimestamp: null,
        gradehistory: []
      };
    }

    const state = res.rows[0];
    state.gradehistory = state.gradehistory || [];
    return state;
  }

  _applyFSRS(state, grade) {
    const now = Date.now();
    const daysSince = state.lastreviewtimestamp
      ? (now - new Date(state.lastreviewtimestamp).getTime()) / 86400000
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
      currentretrievability: retrievability,
      lastreviewtimestamp: new Date(now).toISOString(),
      nextreviewtimestamp: nextReviewTimestamp,
      gradehistory: [...state.gradehistory, { t: now, g: grade }]
    };
  }

  async _persistState(characterId, knowledgeId, updatedState, grade) {
    const reviewId = await generateHexId("review_id");

    await this.pool.query(
      `INSERT INTO knowledge_review_logs
       (review_id, characterid, knowledgeid, reviewtimestamp, grade)
       VALUES ($1, $2, $3, NOW(), $4)`,
      [reviewId, characterId, knowledgeId, grade]
    );

    await this.pool.query(
      `INSERT INTO character_knowledge_state
       (characterid, knowledgeid, difficulty, stability,
        currentretrievability, gradehistory,
        lastreviewtimestamp, nextreviewtimestamp)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (characterid, knowledgeid)
       DO UPDATE SET difficulty = EXCLUDED.difficulty,
                     stability = EXCLUDED.stability,
                     currentretrievability = EXCLUDED.currentretrievability,
                     gradehistory = EXCLUDED.gradehistory,
                     lastreviewtimestamp = EXCLUDED.lastreviewtimestamp,
                     nextreviewtimestamp = EXCLUDED.nextreviewtimestamp`,
      [
        characterId,
        knowledgeId,
        updatedState.difficulty,
        updatedState.stability,
        updatedState.currentretrievability,
        JSON.stringify(updatedState.gradehistory),
        updatedState.lastreviewtimestamp,
        updatedState.nextreviewtimestamp
      ]
    );
  }
}
