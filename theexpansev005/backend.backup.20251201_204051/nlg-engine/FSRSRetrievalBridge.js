import pool from '../db/pool.js';
import knowledgeConfig from '../../config/knowledgeConfig.js';
import MemoryDecayCalculator from '../knowledge/MemoryDecayCalculator.js';

class FSRSRetrievalBridge {
  constructor() {
    this.memoryDecayCalculator = new MemoryDecayCalculator();
    this.traitModifiers = knowledgeConfig.fsrs.traitModifiers;
  }

  async getKnowledgeRetrievability(characterId, knowledgeItemId) {
    try {
      const query = `SELECT stability, difficulty, last_review_at, next_review_at, review_count FROM character_knowledge_fsrs_state WHERE character_id = $1 AND knowledge_item_id = $2`;
      const result = await pool.query(query, [characterId, knowledgeItemId]);
      if (result.rows.length === 0) {
        return { stability: knowledgeConfig.fsrs.defaultStability, retrievability: 0.9, isNew: true, daysOverdue: 0 };
      }
      const record = result.rows[0];
      const now = new Date();
      const lastReview = new Date(record.last_review_at);
      const timeElapsedMs = now - lastReview;
      const timeElapsedDays = timeElapsedMs / (1000 * 60 * 60 * 24);
      const retrievability = this.memoryDecayCalculator.calculateRetrievability(record.stability, timeElapsedDays);
      const nextReview = new Date(record.next_review_at);
      const daysOverdue = Math.max(0, (now - nextReview) / (1000 * 60 * 60 * 24));
      return { stability: record.stability, difficulty: record.difficulty, retrievability: Math.max(0, Math.min(1, retrievability)), reviewCount: record.review_count, daysOverdue: daysOverdue, isNew: false, isOverdue: daysOverdue > 0 };
    } catch (error) {
      console.error(`[FSRSRetrievalBridge] Error getting retrievability for ${characterId}/${knowledgeItemId}:`, error);
      return { stability: knowledgeConfig.fsrs.defaultStability, retrievability: 0.5, error: error.message };
    }
  }

  applyTraitModifiers(baseDifficulty, learningProfile) {
    if (!this.traitModifiers.enabled || !learningProfile) return baseDifficulty;
    let modifiedDifficulty = baseDifficulty;
    const anxietyScore = learningProfile.emotional?.anxiety || 50;
    const disciplineScore = learningProfile.behavioral?.discipline || 50;
    modifiedDifficulty += (anxietyScore / 100) * this.traitModifiers.anxietyDifficultyImpact;
    modifiedDifficulty -= (disciplineScore / 100) * this.traitModifiers.disciplineDifficultyReduction;
    return Math.min(10, Math.max(1, modifiedDifficulty));
  }

  calculateFSRSCognitivePenalty(characterId, daysOverdue) {
    const maxDaysForPenalty = 30;
    const maxPenalty = 0.6;
    const penalty = Math.min(maxPenalty, (daysOverdue / maxDaysForPenalty) * maxPenalty);
    return { penalty: penalty, reason: daysOverdue > 0 ? `${daysOverdue.toFixed(1)} days overdue for FSRS review` : 'knowledge current', severity: daysOverdue > 7 ? 'high' : daysOverdue > 3 ? 'medium' : 'low' };
  }

  scoreSegmentForRetrieval(segment, retrievability, intentFSRSWeight = 0.8) {
    const semanticScore = segment.embedding_similarity || 0.5;
    const fsrsScore = retrievability.retrievability;
    const intentWeight = intentFSRSWeight;
    const combinedScore = (semanticScore * 0.4) + (fsrsScore * intentWeight) + (retrievability.reviewCount > 0 ? 0.1 : 0);
    return { segmentId: segment.id, totalScore: Math.min(1, combinedScore), components: { semantic: semanticScore, fsrs: fsrsScore, reviewBonus: retrievability.reviewCount > 0 ? 0.1 : 0 }, retrievability: retrievability, confidence: retrievability.retrievability > 0.7 ? 'high' : retrievability.retrievability > 0.4 ? 'medium' : 'low' };
  }

  async recordKnowledgeRetrievalSuccess(characterId, knowledgeItemId, grade = 3) {
    try {
      const query = `INSERT INTO character_knowledge_fsrs_state (character_id, knowledge_item_id, stability, difficulty, last_review_at, next_review_at, review_count) VALUES ($1, $2, $3, $4, NOW(), NOW() + INTERVAL '1 day', 1) ON CONFLICT (character_id, knowledge_item_id) DO UPDATE SET review_count = character_knowledge_fsrs_state.review_count + 1, last_review_at = NOW(), next_review_at = NOW() + INTERVAL '1 day' RETURNING *;`;
      await pool.query(query, [characterId, knowledgeItemId, knowledgeConfig.fsrs.defaultStability, knowledgeConfig.fsrs.defaultDifficulty]);
      return { success: true, updated: true };
    } catch (error) {
      console.error(`[FSRSRetrievalBridge] Error updating FSRS state:`, error);
      return { success: false, error: error.message };
    }
  }

  async getOverdueKnowledge(characterId) {
    try {
      const query = `SELECT knowledge_item_id, stability, last_review_at, next_review_at, (NOW() - next_review_at) / INTERVAL '1 day' as days_overdue FROM character_knowledge_fsrs_state WHERE character_id = $1 AND next_review_at < NOW() ORDER BY days_overdue DESC`;
      const result = await pool.query(query, [characterId]);
      return result.rows;
    } catch (error) {
      console.error(`[FSRSRetrievalBridge] Error getting overdue knowledge:`, error);
      return [];
    }
  }
}

export default new FSRSRetrievalBridge();
