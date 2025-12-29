import pool from '../db/pool.js';

class NgramSurprisal {
  constructor(n = 3) {
    this.n = n;
    this.ngramCounts = new Map();
    this.bigramCounts = new Map();
    this.totalNgrams = 0;
    this.totalBigrams = 0;
    this.trained = false;
  }

  async train() {
    console.log('[NgramSurprisal] Training on LTLM corpus...');
    
    const result = await pool.query(`
      SELECT utterance_text
      FROM ltlm_training_examples
    `);
    
    for (const row of result.rows) {
      const tokens = this.tokenize(row.utterance_text);
      
      for (let i = 0; i <= tokens.length - this.n; i++) {
        const ngram = tokens.slice(i, i + this.n).join(' ');
        this.ngramCounts.set(ngram, (this.ngramCounts.get(ngram) || 0) + 1);
        this.totalNgrams++;
      }
      
      for (let i = 0; i <= tokens.length - 2; i++) {
        const bigram = tokens.slice(i, i + 2).join(' ');
        this.bigramCounts.set(bigram, (this.bigramCounts.get(bigram) || 0) + 1);
        this.totalBigrams++;
      }
    }
    
    this.trained = true;
    console.log(`[NgramSurprisal] Trained on ${this.ngramCounts.size} trigrams and ${this.bigramCounts.size} bigrams from ${result.rows.length} utterances`);
    
    return {
      trigramCount: this.ngramCounts.size,
      bigramCount: this.bigramCounts.size,
      totalNgrams: this.totalNgrams,
      totalBigrams: this.totalBigrams,
      trainingExamples: result.rows.length
    };
  }

  surprisal(text) {
    if (!this.trained) {
      throw new Error('NgramSurprisal not trained. Call train() first.');
    }
    
    const tokens = this.tokenize(text);
    const trigrams = [];
    const bigrams = [];
    
    for (let i = 0; i <= tokens.length - this.n; i++) {
      trigrams.push(tokens.slice(i, i + this.n).join(' '));
    }
    
    for (let i = 0; i <= tokens.length - 2; i++) {
      bigrams.push(tokens.slice(i, i + 2).join(' '));
    }
    
    if (trigrams.length === 0 && bigrams.length === 0) {
      return { 
        score: 0, 
        novelTrigrams: [], 
        novelBigrams: [],
        coverage: 1.0 
      };
    }
    
    let trigramSurprisal = 0;
    const novelTrigrams = [];
    
    for (const trigram of trigrams) {
      const count = this.ngramCounts.get(trigram) || 0;
      
      if (count === 0) {
        novelTrigrams.push(trigram);
        trigramSurprisal += 10;
      } else {
        const prob = count / this.totalNgrams;
        trigramSurprisal += -Math.log2(prob);
      }
    }
    
    let bigramSurprisal = 0;
    const novelBigrams = [];
    
    for (const bigram of bigrams) {
      const count = this.bigramCounts.get(bigram) || 0;
      
      if (count === 0) {
        novelBigrams.push(bigram);
        bigramSurprisal += 8;
      } else {
        const prob = count / this.totalBigrams;
        bigramSurprisal += -Math.log2(prob);
      }
    }
    
    const totalNgrams = trigrams.length + bigrams.length;
    const avgSurprisal = totalNgrams > 0 
      ? (trigramSurprisal + bigramSurprisal) / totalNgrams 
      : 0;
    
    const novelCount = novelTrigrams.length + novelBigrams.length;
    
    return {
      score: avgSurprisal,
      novelTrigrams,
      novelBigrams,
      coverage: 1 - (novelCount / totalNgrams),
      trigramCoverage: 1 - (novelTrigrams.length / Math.max(1, trigrams.length)),
      bigramCoverage: 1 - (novelBigrams.length / Math.max(1, bigrams.length))
    };
  }

  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[\u2018\u2019]/g, '')
      .replace(/['']/g, '')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);
  }
}

export default new NgramSurprisal(3);
