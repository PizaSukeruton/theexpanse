import pool from '../db/pool.js';

class PADEstimator {
  constructor() {
    this.wordPADMap = new Map();
    this.documentFrequency = new Map();
    this.totalDocuments = 0;
    this.trained = false;
  }

  async train() {
    console.log('[PADEstimator] Training on LTLM corpus + PAD training examples...');
    
    const result = await pool.query(`
      SELECT utterance_text, pad_pleasure, pad_arousal, pad_dominance, 'ltlm' as source_table
      FROM ltlm_training_examples
      WHERE pad_pleasure IS NOT NULL
        AND pad_arousal IS NOT NULL
        AND pad_dominance IS NOT NULL
      UNION ALL
      SELECT utterance_text, pad_pleasure, pad_arousal, pad_dominance, 'pad_training' as source_table
      FROM pad_training_examples
      WHERE pad_pleasure IS NOT NULL
        AND pad_arousal IS NOT NULL
        AND pad_dominance IS NOT NULL
    `);
    
    const ltlmCount = result.rows.filter(r => r.source_table === 'ltlm').length;
    const padCount = result.rows.filter(r => r.source_table === 'pad_training').length;
    console.log(`[PADEstimator] Sources: ${ltlmCount} LTLM utterances + ${padCount} PAD training examples`);
    
    this.totalDocuments = result.rows.length;
    const wordContributions = new Map();
    
    for (const row of result.rows) {
      const words = this.tokenize(row.utterance_text);
      const uniqueWords = new Set(words);
      const pad = {
        p: parseFloat(row.pad_pleasure),
        a: parseFloat(row.pad_arousal),
        d: parseFloat(row.pad_dominance)
      };
      
      for (const word of uniqueWords) {
        this.documentFrequency.set(
          word, 
          (this.documentFrequency.get(word) || 0) + 1
        );
      }
      
      for (const word of words) {
        if (!wordContributions.has(word)) {
          wordContributions.set(word, {
            pSum: 0, aSum: 0, dSum: 0, count: 0
          });
        }
        
        const contrib = wordContributions.get(word);
        contrib.pSum += pad.p;
        contrib.aSum += pad.a;
        contrib.dSum += pad.d;
        contrib.count += 1;
      }
    }
    
    for (const [word, contrib] of wordContributions.entries()) {
      const df = this.documentFrequency.get(word) || 1;
      const idf = Math.log((this.totalDocuments + 1) / (df + 1)) + 1;
      
      const avgP = contrib.pSum / contrib.count;
      const avgA = contrib.aSum / contrib.count;
      const avgD = contrib.dSum / contrib.count;
      
      this.wordPADMap.set(word, {
        p: avgP,
        a: avgA,
        d: avgD,
        idf: idf,
        confidence: contrib.count,
        documentFrequency: df
      });
    }
    
    this.trained = true;
    console.log(`[PADEstimator] Trained on ${this.wordPADMap.size} unique words from ${this.totalDocuments} utterances`);
    
    return {
      vocabularySize: this.wordPADMap.size,
      trainingExamples: this.totalDocuments,
      ltlmExamples: ltlmCount,
      padTrainingExamples: padCount,
      avgDocFreq: (this.totalDocuments / this.wordPADMap.size).toFixed(2)
    };
  }

  estimate(text) {
    if (!this.trained) {
      throw new Error('PADEstimator not trained. Call train() first.');
    }
    
    const words = this.tokenize(text);
    let pSum = 0, aSum = 0, dSum = 0;
    let totalWeight = 0;
    let knownWords = 0;
    const unknownWords = [];
    
    for (const word of words) {
      if (this.wordPADMap.has(word)) {
        const padData = this.wordPADMap.get(word);
        const weight = Math.log(1 + padData.confidence) * padData.idf;
        
        pSum += padData.p * weight;
        aSum += padData.a * weight;
        dSum += padData.d * weight;
        totalWeight += weight;
        knownWords++;
      } else {
        unknownWords.push(word);
      }
    }
    
    if (knownWords === 0) {
      return {
        pad: { pleasure: 0, arousal: 0, dominance: 0 },
        coverage: 0,
        confidence: 0,
        novelty: 'no_known_lexical_affect',
        knownWords: 0,
        totalWords: words.length,
        unknownWords: unknownWords
      };
    }
    
    // Calculate confidence based on coverage and known word count
    const coverage = knownWords / words.length;
    const confidence = Math.min(1, coverage * Math.log(1 + knownWords) / 2);
    
    return {
      pad: {
        pleasure: pSum / totalWeight,
        arousal: aSum / totalWeight,
        dominance: dSum / totalWeight
      },
      coverage,
      confidence,
      knownWords,
      totalWords: words.length,
      unknownWords: unknownWords.length > 0 ? unknownWords : undefined
    };
  }

  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[\u2018\u2019]/g, '')
      .replace(/['']/g, '')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }
  
  getWordPAD(word) {
    const normalized = word.toLowerCase();
    return this.wordPADMap.get(normalized) || null;
  }
  
  getVocabularyStats() {
    if (!this.trained) {
      return null;
    }
    
    const idfValues = Array.from(this.wordPADMap.values()).map(w => w.idf);
    const confidenceValues = Array.from(this.wordPADMap.values()).map(w => w.confidence);
    
    return {
      vocabularySize: this.wordPADMap.size,
      totalDocuments: this.totalDocuments,
      avgIDF: (idfValues.reduce((a, b) => a + b, 0) / idfValues.length).toFixed(3),
      avgConfidence: (confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length).toFixed(2),
      maxConfidence: Math.max(...confidenceValues),
      minConfidence: Math.min(...confidenceValues)
    };
  }
}

export default new PADEstimator();
