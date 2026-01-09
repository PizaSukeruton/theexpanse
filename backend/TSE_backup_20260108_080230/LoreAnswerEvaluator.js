import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

export default class LoreAnswerEvaluator {
  static async evaluateAndStore(evalData) {
    try {
      const { task, characterId, answer } = evalData;
      const { taskId, knowledgeId } = task;

      // Get the canonical facts for this knowledge item
      const factResult = await pool.query(
        `SELECT canonical_facts FROM lore_knowledge_graph WHERE knowledge_id = $1`,
        [knowledgeId]
      );

      if (factResult.rows.length === 0) {
        throw new Error('Knowledge item not found');
      }

      const canonicalFacts = factResult.rows[0].canonical_facts;
      const coreFact = canonicalFacts.core_fact || '';

      // Evaluate answer against core fact
      const evaluation = this.scoreAnswer(answer, coreFact);

      // Store the response
      const responseId = await generateHexId('tse_evaluation_record_id');
      
      await pool.query(
        `INSERT INTO lore_task_responses 
         (response_id, task_id, character_id, knowledge_id, user_answer, normalized_answer, score, feedback, evaluator_details)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          responseId,
          taskId,
          characterId,
          knowledgeId,
          answer,
          evaluation.details.normalizedAnswer,
          evaluation.score,
          evaluation.feedback,
          JSON.stringify(evaluation.details)
        ]
      );

      return {
        responseId,
        taskId,
        characterId,
        knowledgeId,
        score: evaluation.score,
        feedback: evaluation.feedback,
        details: evaluation.details
      };
    } catch (e) {
      console.error('[LoreAnswerEvaluator] Error:', e.message);
      throw e;
    }
  }

  static scoreAnswer(userAnswer, canonicalFact) {
    // Normalize both strings
    const normalizedAnswer = userAnswer.toLowerCase().trim();
    const normalizedFact = canonicalFact.toLowerCase().trim();

    // Extract keywords from canonical fact (non-stop words, >3 chars)
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
      'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
      'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you',
      'he', 'she', 'it', 'we', 'they', 'from', 'by', 'as', 'with'
    ]);

    const factWords = normalizedFact
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w));

    const answerWords = new Set(
      normalizedAnswer
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w))
    );

    // Count matches
    const matchedKeywords = factWords.filter(w => answerWords.has(w));
    const missedKeywords = factWords.filter(w => !answerWords.has(w));
    const matchRatio = factWords.length > 0 
      ? matchedKeywords.length / factWords.length 
      : 0;

    // Score: 0-5 based on match ratio
    let score = 0;
    if (matchRatio >= 0.9) score = 5;
    else if (matchRatio >= 0.75) score = 4;
    else if (matchRatio >= 0.5) score = 3;
    else if (matchRatio >= 0.25) score = 2;
    else if (matchRatio > 0) score = 1;
    else score = 0;

    const feedback = `${score} / 5 - ${(matchRatio * 100).toFixed(1)}% match ratio`;

    return {
      score,
      feedback,
      details: {
        score,
        normalizedAnswer,
        keywords: factWords,
        matchedKeywords,
        missedKeywords,
        matchRatio,
        canonicalFact
      }
    };
  }
}
