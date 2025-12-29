import pool from '../db/pool.js';

class MetaphorDetector {
  constructor() {
    this.patterns = [
      { regex: /\blike\s+(\S+.*)/i, name: 'simile_like' },
      { regex: /\bas\s+if\s+(\S+.*)/i, name: 'simile_as_if' },
      { regex: /\bfeels?\s+like\s+(\S+.*)/i, name: 'simile_feels' },
      { regex: /\bdrowning\s+in\s+(\S+)/i, name: 'domain_drowning' },
      { regex: /\bfractured\s+into\s+(\S+)/i, name: 'domain_fractured' },
      { regex: /\bpressing\s+down/i, name: 'domain_pressing' },
      { regex: /\bshattered\s+into\s+(\S+)/i, name: 'domain_shattered' },
      { regex: /\bstatic\s+noise/i, name: 'domain_static' },
      { regex: /\bfilling\s+every\s+corner/i, name: 'domain_filling' }
    ];
    this.concretenessMap = new Map();
    this.trained = false;
  }

  async train() {
    console.log('[MetaphorDetector] Training on LTLM corpus...');
    
    const result = await pool.query(`
      SELECT utterance_text, tags
      FROM ltlm_training_examples
      WHERE tags IS NOT NULL
    `);
    
    const wordContexts = new Map();
    
    for (const row of result.rows) {
      const words = this.tokenize(row.utterance_text);
      const tags = row.tags || [];
      
      const hasPhysical = tags.some(t => 
        t.includes('physical') || 
        t.includes('sensory') || 
        t.includes('body') ||
        t.includes('concrete')
      );
      
      const hasAbstract = tags.some(t => 
        t.includes('emotional') || 
        t.includes('cognitive') || 
        t.includes('abstract') ||
        t.includes('conceptual')
      );
      
      for (const word of words) {
        if (!wordContexts.has(word)) {
          wordContexts.set(word, { physical: 0, abstract: 0, total: 0 });
        }
        
        const context = wordContexts.get(word);
        if (hasPhysical) context.physical++;
        if (hasAbstract) context.abstract++;
        context.total++;
      }
    }
    
    for (const [word, context] of wordContexts.entries()) {
      const total = context.physical + context.abstract;
      if (total > 0) {
        this.concretenessMap.set(word, {
          score: (context.physical - context.abstract) / total,
          confidence: total,
          physicalCount: context.physical,
          abstractCount: context.abstract
        });
      }
    }
    
    this.trained = true;
    console.log(`[MetaphorDetector] Trained on ${this.concretenessMap.size} words from ${result.rows.length} utterances`);
    
    return {
      vocabularySize: this.concretenessMap.size,
      trainingExamples: result.rows.length,
      patternsActive: this.patterns.length
    };
  }

  detect(text) {
    if (!this.trained) {
      throw new Error('MetaphorDetector not trained. Call train() first.');
    }
    
    for (const pattern of this.patterns) {
      const match = text.match(pattern.regex);
      if (match) {
        return {
          isMetaphor: true,
          pattern: pattern.name,
          phrase: match[1] || match[0],
          matchedText: match[0],
          method: 'syntactic_pattern',
          confidence: 0.9
        };
      }
    }
    
    const words = this.tokenize(text);
    const verbs = this.extractVerbs(words, text);
    const objects = this.extractObjects(words);
    
    for (const verb of verbs) {
      const verbConcreteness = this.concretenessMap.get(verb);
      if (!verbConcreteness || verbConcreteness.confidence < 3) continue;
      
      for (const obj of objects) {
        const objConcreteness = this.concretenessMap.get(obj);
        if (!objConcreteness || objConcreteness.confidence < 3) continue;
        
        const delta = Math.abs(verbConcreteness.score - objConcreteness.score);
        
        if (delta > 0.6 && verbConcreteness.score > objConcreteness.score) {
          return {
            isMetaphor: true,
            pattern: 'concreteness_mismatch',
            phrase: `${verb} ${obj}`,
            delta: delta.toFixed(3),
            verbConcreteness: verbConcreteness.score.toFixed(3),
            objectConcreteness: objConcreteness.score.toFixed(3),
            method: 'semantic_incongruity',
            confidence: Math.min(0.8, delta)
          };
        }
      }
    }
    
    return {
      isMetaphor: false,
      method: 'none',
      confidence: 0
    };
  }

  extractVerbs(words, originalText) {
    const verbIndicators = ['ing', 'ed', 'es', 's'];
    const commonVerbs = new Set([
      'is', 'are', 'was', 'were', 'feel', 'feels', 'felt',
      'seem', 'seems', 'seemed', 'become', 'becomes', 'became',
      'bleed', 'bleeds', 'drown', 'drowns', 'fracture', 'fractures',
      'press', 'presses', 'shatter', 'shatters', 'fill', 'fills'
    ]);
    
    const verbs = words.filter(w => {
      if (commonVerbs.has(w)) return true;
      return verbIndicators.some(suffix => w.endsWith(suffix) && w.length > suffix.length + 2);
    });
    
    return [...new Set(verbs)];
  }

  extractObjects(words) {
    return words.filter(w => w.length > 3);
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
  
  getWordConcreteness(word) {
    const normalized = word.toLowerCase();
    return this.concretenessMap.get(normalized) || null;
  }
}

export default new MetaphorDetector();
