import generateHexId from './hexIdGenerator.js';

const SIGNIFICANCE_KEYWORDS = [
  'remember', 'important', 'fact', 'discovered', 'learned',
  'critical', 'key', 'must know', 'vital', 'essential',
  'breakthrough', 'revelation', 'insight', 'discovery'
];

const HIGH_VALUE_INTENTS = ['WHO', 'WHAT', 'WHERE', 'WHY', 'SHOW_IMAGE', 'SEARCH'];

class SignificanceScorer {
  async scoreExchange(queryCommand, queryResponse, metadata = {}) {
    let score = 0;
    const signals = {};

    score += this.scoreKeywords(queryCommand, queryResponse, signals);
    score += this.scoreIntentType(metadata.queryType, signals);
    score += this.scoreContextChange(metadata.entityUsed, metadata.lastEntity, signals);
    score += this.scoreConfidence(metadata.confidence, signals);
    score += this.scoreQueryComplexity(queryCommand, signals);
    score += this.scoreResultQuality(metadata.resultCount, metadata.relevance, signals);

    const isSignificant = score >= 0.65;

    return {
      score: Math.min(1.0, score),
      isSignificant,
      signals,
      recommendation: isSignificant ? 'ASK_TO_REMEMBER' : 'SKIP',
      summaryTrigger: score > 0.8
    };
  }

  scoreKeywords(command, response, signals) {
    let score = 0;
    const text = `${command} ${response}`.toLowerCase();

    const keywordMatches = SIGNIFICANCE_KEYWORDS.filter(kw => text.includes(kw)).length;
    if (keywordMatches > 0) {
      score += 0.3;
      signals.keywords = { found: keywordMatches, weight: 0.3 };
    }

    return score;
  }

  scoreIntentType(intentType, signals) {
    let score = 0;
    if (HIGH_VALUE_INTENTS.includes(intentType?.toUpperCase())) {
      score = 0.25;
      signals.intentType = { type: intentType, weight: 0.25 };
    }
    return score;
  }

  scoreContextChange(currentEntity, lastEntity, signals) {
    let score = 0;
    if (currentEntity && currentEntity !== lastEntity) {
      score = 0.15;
      signals.contextChange = { from: lastEntity, to: currentEntity, weight: 0.15 };
    }
    return score;
  }

  scoreConfidence(confidence, signals) {
    let score = 0;
    if (confidence && confidence > 0.85) {
      score = 0.15;
      signals.confidence = { value: confidence, weight: 0.15 };
    }
    return score;
  }

  scoreQueryComplexity(command, signals) {
    let score = 0;
    const words = command.split(' ').length;
    const hasFollowUp = command.includes('also') || command.includes('additionally') || command.includes('what about');

    if (words > 8 || hasFollowUp) {
      score = 0.1;
      signals.complexity = { wordCount: words, isFollowUp: hasFollowUp, weight: 0.1 };
    }

    return score;
  }

  scoreResultQuality(resultCount, relevance, signals) {
    let score = 0;
    if (resultCount && resultCount > 0 && relevance && relevance > 0.7) {
      score = 0.1;
      signals.resultQuality = { count: resultCount, relevance, weight: 0.1 };
    }
    return score;
  }

  async createAskToRememberPrompt(queryCommand, entityUsed, score) {
    return {
      prompt: `I noticed something interesting we just discovered about ${entityUsed}. Should I save this to memory so I can reference it next time?`,
      confirmAction: 'memory:ask-to-save',
      metadata: {
        query: queryCommand,
        entity: entityUsed,
        significanceScore: score
      }
    };
  }
}

export default new SignificanceScorer();
