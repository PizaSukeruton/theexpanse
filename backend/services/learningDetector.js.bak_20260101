import padEstimator from './padEstimator.js';
import ngramSurprisal from './ngramSurprisal.js';
import metaphorDetector from './metaphorDetector.js';
import pool from '../db/pool.js';

class LearningDetector {
  async detectLearningOpportunity(message, userId) {
    const signals = {
      padNovelty: false,
      ngramNovelty: false,
      metaphorDetected: false,
      padSparse: false,
      lowCoverage: false,
      highSurprisal: false
    };
    
    const padResult = padEstimator.estimate(message);
    signals.lowCoverage = padResult.coverage < 0.6;
    
    if (padResult.novelty === 'no_known_lexical_affect') {
      signals.padNovelty = true;
    }
    
    if (padResult.coverage > 0) {
      const nearby = await pool.query(`
        SELECT COUNT(*) as count
        FROM ltlm_training_examples 
        WHERE ABS(pad_pleasure - $1) < 0.25 
          AND ABS(pad_arousal - $2) < 0.25 
          AND ABS(pad_dominance - $3) < 0.25
      `, [padResult.pad.pleasure, padResult.pad.arousal, padResult.pad.dominance]);
      
      signals.padSparse = nearby.rows[0].count < 3;
    } else {
      signals.padSparse = false;
    }
    
    const surprisalResult = ngramSurprisal.surprisal(message);
    signals.ngramNovelty = surprisalResult.coverage < 0.5;
    signals.highSurprisal = surprisalResult.score > 6.0;
    
    const metaphorResult = metaphorDetector.detect(message);
    signals.metaphorDetected = metaphorResult.isMetaphor;
    
    const triggeredSignals = Object.values(signals).filter(Boolean);
    const shouldAsk = triggeredSignals.length >= 2;
    
    return {
      shouldAsk,
      signals,
      triggerCount: triggeredSignals.length,
      confidence: triggeredSignals.length / 6,
      phrase: message,
      pad: padResult.pad,
      coverage: padResult.coverage,
      unknownWords: padResult.unknownWords,
      metaphor: metaphorResult.isMetaphor ? metaphorResult : undefined,
      novelNgrams: surprisalResult.novelTrigrams.concat(surprisalResult.novelBigrams).slice(0, 3),
      surprisalScore: surprisalResult.score,
      triggeredSignalNames: Object.keys(signals).filter(k => signals[k])
    };
  }
  
  getSignalExplanations(signals) {
    const explanations = [];
    
    if (signals.padNovelty) {
      explanations.push('no known emotional words');
    }
    if (signals.padSparse) {
      explanations.push('sparse emotional vocabulary');
    }
    if (signals.lowCoverage) {
      explanations.push('low lexical coverage');
    }
    if (signals.ngramNovelty) {
      explanations.push('novel word combinations');
    }
    if (signals.highSurprisal) {
      explanations.push('statistically unexpected phrasing');
    }
    if (signals.metaphorDetected) {
      explanations.push('figurative language detected');
    }
    
    return explanations;
  }
}

export default new LearningDetector();
