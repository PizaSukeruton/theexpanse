/**
 * SemanticEmbedder.js
 * 
 * Learns semantic meaning from the LTLM corpus ONLY.
 * No external models. No APIs. No downloaded weights.
 * 
 * Architecture:
 *   Layer 1: Co-occurrence embeddings (unsupervised)
 *   Layer 2: PPMI weighting (reduces frequency domination)
 *   Layer 3: Truncated SVD (dense vector projection)
 *   Layer 4: Hierarchical intent shaping (supervised)
 * 
 * Semantic Hierarchy:
 *   β centroid = outcome_intent_code (WHY - primary semantic anchor)
 *   γ centroid = dialogue_function_code (HOW - secondary tactical anchor)
 * 
 * "Claude won't know language in the abstract.
 *  He'll know how THIS world speaks."
 * 
 * Features:
 *   - Vocab cap (prevents O(n³) explosion)
 *   - Hierarchical shaping (outcome > dialogue_function)
 *   - Runtime intent projection
 *   - Error handling
 *   - PAD-aware similarity scoring
 *   - Stop-word filtering
 *   - Skip-count logging
 */

import pool from '../db/pool.js';

// Stop words to filter from tokenization (improves semantic signal)
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
  'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with',
  'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
  'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now', 'its',
  'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'their', 'them', 'they',
  'your', 'you', 'our', 'out', 'about', 'get', 'got', 'getting'
]);

class SemanticEmbedder {
  constructor(options = {}) {
    // Configuration (tunable via constructor)
    this.vectorDimensions = options.vectorDimensions || 64;
    this.minWordFrequency = options.minWordFrequency || 2;
    this.maxVocabSize = options.maxVocabSize || 1500;  // CRITICAL: Prevents O(n³) explosion
    
    // Hierarchical shaping weights (must sum to 1.0)
    this.alphaOriginal = options.alphaOriginal || 0.60;       // Preserve lexical meaning
    this.betaOutcomeIntent = options.betaOutcomeIntent || 0.25; // Primary: outcome_intent_code
    this.gammaDialogueFunction = options.gammaDialogueFunction || 0.15; // Secondary: dialogue_function_code
    
    // Runtime intent projection strength
    this.runtimeIntentProjection = options.runtimeIntentProjection || 0.85;
    
    // PAD-aware scoring weights
    this.padSimilarityWeight = options.padSimilarityWeight || 0.15;
    this.semanticSimilarityWeight = options.semanticSimilarityWeight || 0.85;
    
    // Whether to filter stop words
    this.filterStopWords = options.filterStopWords !== false; // Default: true
    
    // Learned structures
    this.wordVectors = new Map();              // word → Float64Array
    this.utteranceVectors = new Map();         // training_example_id → {vector, outcomeIntent, dialogueFunction, ...}
    this.dialogueFunctionCentroids = new Map(); // dialogue_function_code → Float64Array
    this.outcomeIntentCentroids = new Map();   // outcome_intent_code → Float64Array
    this.utterancePAD = new Map();             // training_example_id → {p, a, d}
    
    // Vocabulary
    this.vocabIndex = new Map();       // word → index
    this.indexVocab = [];              // index → word
    
    // Training stats
    this.trainingStats = null;
    this.trained = false;
  }

  async train() {
    console.log('[SemanticEmbedder] Training on LTLM corpus...');
    const startTime = Date.now();

    try {
      // 1. Load all utterances with outcome intents, dialogue functions, and PAD scores
      const result = await pool.query(`
        SELECT 
          te.training_example_id,
          te.utterance_text,
          te.dialogue_function_code,
          te.speech_act_code,
          te.pad_pleasure,
          te.pad_arousal,
          te.pad_dominance,
          toi.outcome_intent_code
        FROM ltlm_training_examples te
        LEFT JOIN ltlm_training_outcome_intents toi 
          ON te.training_example_id = toi.training_example_id
        WHERE te.utterance_text IS NOT NULL
      `);

      const utterances = result.rows;
      console.log(`[SemanticEmbedder] Loaded ${utterances.length} utterances`);

      // Store PAD values for later similarity scoring
      let padCount = 0;
      for (const row of utterances) {
        if (row.pad_pleasure !== null && row.pad_arousal !== null && row.pad_dominance !== null) {
          this.utterancePAD.set(row.training_example_id, {
            p: parseFloat(row.pad_pleasure),
            a: parseFloat(row.pad_arousal),
            d: parseFloat(row.pad_dominance)
          });
          padCount++;
        }
      }
      console.log(`[SemanticEmbedder] Loaded ${padCount} PAD scores`);

      // 2. Build vocabulary with frequency filtering
      const wordFrequency = new Map();
      for (const row of utterances) {
        const words = this.tokenize(row.utterance_text);
        for (const word of words) {
          wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        }
      }

      // Filter by minimum frequency, then cap vocabulary size
      // CRITICAL: This prevents O(n³) explosion in SVD
      const filteredVocab = [...wordFrequency.entries()]
        .filter(([word, freq]) => freq >= this.minWordFrequency)
        .sort((a, b) => b[1] - a[1])  // Sort by frequency descending
        .slice(0, this.maxVocabSize); // Cap at max size

      let vocabIdx = 0;
      for (const [word, freq] of filteredVocab) {
        this.vocabIndex.set(word, vocabIdx);
        this.indexVocab.push(word);
        vocabIdx++;
      }
      console.log(`[SemanticEmbedder] Vocabulary: ${this.indexVocab.length} words (capped from ${wordFrequency.size}, min freq: ${this.minWordFrequency})`);

      // 3. Build co-occurrence matrix
      const vocabSize = this.indexVocab.length;
      const coocMatrix = this.createMatrix(vocabSize, vocabSize);

      for (const row of utterances) {
        const words = this.tokenize(row.utterance_text);
        const uniqueWords = [...new Set(words)].filter(w => this.vocabIndex.has(w));
        
        // Full-utterance window: all words co-occur
        for (let i = 0; i < uniqueWords.length; i++) {
          for (let j = i + 1; j < uniqueWords.length; j++) {
            const idx1 = this.vocabIndex.get(uniqueWords[i]);
            const idx2 = this.vocabIndex.get(uniqueWords[j]);
            coocMatrix[idx1][idx2] += 1;
            coocMatrix[idx2][idx1] += 1;
          }
        }
      }

      // 4. Apply PPMI (Positive Pointwise Mutual Information)
      const ppmiMatrix = this.computePPMI(coocMatrix);

      // 5. Reduce dimensionality via truncated SVD approximation
      console.log(`[SemanticEmbedder] Running SVD (vocab: ${vocabSize}, dims: ${this.vectorDimensions})...`);
      const wordVectorMatrix = this.truncatedSVD(ppmiMatrix, this.vectorDimensions);
      
      // Store word vectors
      for (let i = 0; i < this.indexVocab.length; i++) {
        const word = this.indexVocab[i];
        this.wordVectors.set(word, wordVectorMatrix[i]);
      }
      console.log(`[SemanticEmbedder] Computed ${this.wordVectors.size} word vectors`);

      // 6. Compute utterance vectors (average of word vectors) - BEFORE shaping
      let skippedCount = 0;
      let noOutcomeIntentCount = 0;
      let noDialogueFunctionCount = 0;
      
      for (const row of utterances) {
        const words = this.tokenize(row.utterance_text).filter(w => this.wordVectors.has(w));
        if (words.length === 0) {
          skippedCount++;
          continue;
        }

        const vec = this.averageVectors(words.map(w => this.wordVectors.get(w)));
        const normalized = this.normalize(vec);
        
        if (!row.outcome_intent_code) noOutcomeIntentCount++;
        if (!row.dialogue_function_code) noDialogueFunctionCount++;
        
        this.utteranceVectors.set(row.training_example_id, {
          vector: normalized,
          outcomeIntent: row.outcome_intent_code || null,
          dialogueFunction: row.dialogue_function_code || null,
          speechAct: row.speech_act_code || null
        });
      }
      console.log(`[SemanticEmbedder] Computed ${this.utteranceVectors.size} utterance vectors`);
      console.log(`[SemanticEmbedder] Skipped ${skippedCount} utterances (no known words)`);
      console.log(`[SemanticEmbedder] ${noOutcomeIntentCount} utterances missing outcome_intent_code`);
      console.log(`[SemanticEmbedder] ${noDialogueFunctionCount} utterances missing dialogue_function_code`);

      // 7. Compute OUTCOME-INTENT centroids (β - primary semantic anchor: WHY)
      const outcomeGroups = new Map();
      for (const [id, data] of this.utteranceVectors.entries()) {
        if (!data.outcomeIntent) continue;
        if (!outcomeGroups.has(data.outcomeIntent)) {
          outcomeGroups.set(data.outcomeIntent, []);
        }
        outcomeGroups.get(data.outcomeIntent).push(data.vector);
      }

      for (const [outcomeIntent, vectors] of outcomeGroups.entries()) {
        const centroid = this.averageVectors(vectors);
        this.outcomeIntentCentroids.set(outcomeIntent, this.normalize(centroid));
      }
      console.log(`[SemanticEmbedder] Computed ${this.outcomeIntentCentroids.size} outcome-intent centroids (β - WHY)`);

      // 8. Compute DIALOGUE-FUNCTION centroids (γ - secondary tactical anchor: HOW)
      const dialogueGroups = new Map();
      for (const [id, data] of this.utteranceVectors.entries()) {
        if (!data.dialogueFunction) continue;
        if (!dialogueGroups.has(data.dialogueFunction)) {
          dialogueGroups.set(data.dialogueFunction, []);
        }
        dialogueGroups.get(data.dialogueFunction).push(data.vector);
      }

      for (const [dialogueFunction, vectors] of dialogueGroups.entries()) {
        const centroid = this.averageVectors(vectors);
        this.dialogueFunctionCentroids.set(dialogueFunction, this.normalize(centroid));
      }
      console.log(`[SemanticEmbedder] Computed ${this.dialogueFunctionCentroids.size} dialogue-function centroids (γ - HOW)`);

      // 9. HIERARCHICAL SHAPING: Shape utterance vectors with weighted blend
      // shaped = α*original + β*outcomeCentroid + γ*dialogueFunctionCentroid
      let shapedCount = 0;
      for (const [id, data] of this.utteranceVectors.entries()) {
        const outcomeCentroid = data.outcomeIntent 
          ? this.outcomeIntentCentroids.get(data.outcomeIntent) 
          : null;
        const dialogueCentroid = data.dialogueFunction 
          ? this.dialogueFunctionCentroids.get(data.dialogueFunction) 
          : null;

        if (!outcomeCentroid && !dialogueCentroid) continue;

        let shaped = new Float64Array(this.vectorDimensions);
        
        // Start with original vector weighted by alpha
        for (let i = 0; i < this.vectorDimensions; i++) {
          shaped[i] = this.alphaOriginal * data.vector[i];
        }

        // Add outcome-intent centroid weighted by beta (WHY)
        if (outcomeCentroid) {
          for (let i = 0; i < this.vectorDimensions; i++) {
            shaped[i] += this.betaOutcomeIntent * outcomeCentroid[i];
          }
        } else {
          // Redistribute beta to alpha if no outcome centroid
          for (let i = 0; i < this.vectorDimensions; i++) {
            shaped[i] += this.betaOutcomeIntent * data.vector[i];
          }
        }

        // Add dialogue-function centroid weighted by gamma (HOW)
        if (dialogueCentroid) {
          for (let i = 0; i < this.vectorDimensions; i++) {
            shaped[i] += this.gammaDialogueFunction * dialogueCentroid[i];
          }
        } else {
          // Redistribute gamma to alpha if no dialogue centroid
          for (let i = 0; i < this.vectorDimensions; i++) {
            shaped[i] += this.gammaDialogueFunction * data.vector[i];
          }
        }

        data.vector = this.normalize(shaped);
        shapedCount++;
      }
      console.log(`[SemanticEmbedder] Shaped ${shapedCount} utterance vectors toward centroids`);

      this.trained = true;
      const elapsed = Date.now() - startTime;
      
      // Store training stats
      this.trainingStats = {
        vocabularySize: this.wordVectors.size,
        utteranceCount: this.utteranceVectors.size,
        outcomeIntentCentroids: this.outcomeIntentCentroids.size,
        dialogueFunctionCentroids: this.dialogueFunctionCentroids.size,
        dimensions: this.vectorDimensions,
        trainingTimeMs: elapsed,
        skippedUtterances: skippedCount,
        utterancesWithoutOutcomeIntent: noOutcomeIntentCount,
        utterancesWithoutDialogueFunction: noDialogueFunctionCount,
        shapedUtterances: shapedCount,
        padScoresLoaded: padCount
      };
      
      console.log(`[SemanticEmbedder] Training complete in ${elapsed}ms`);

      return this.trainingStats;

    } catch (err) {
      console.error('[SemanticEmbedder] Training failed:', err.message);
      console.error(err.stack);
      return null;
    }
  }

  /**
   * Find semantically similar utterances
   * @param {string} text - Input text to match
   * @param {number} topK - Number of results to return
   * @param {object} options - Optional filters: { outcomeIntent, dialogueFunction, targetPad: {p, a, d} }
   * @returns {object} - { results, coverage, inputWords }
   */
  async findSimilar(text, topK = 5, options = {}) {
    if (!this.trained) {
      throw new Error('[SemanticEmbedder] Not trained. Call train() first.');
    }

    // Vectorize input
    const allWords = this.tokenize(text);
    const knownWords = allWords.filter(w => this.wordVectors.has(w));
    
    if (knownWords.length === 0) {
      return {
        results: [],
        coverage: 0,
        message: 'No known words in input'
      };
    }

    let inputVec = this.normalize(
      this.averageVectors(knownWords.map(w => this.wordVectors.get(w)))
    );

    // RUNTIME INTENT PROJECTION: Shape input toward closest centroid
    const closestCentroid = this.findClosestCentroid(inputVec);
    if (closestCentroid) {
      inputVec = this.shapeVector(
        inputVec, 
        closestCentroid.vector, 
        this.runtimeIntentProjection
      );
      inputVec = this.normalize(inputVec);
    }

    // Calculate similarities with optional PAD awareness
    const similarities = [];
    for (const [id, data] of this.utteranceVectors.entries()) {
      // Filter by outcome intent if specified
      if (options.outcomeIntent && data.outcomeIntent !== options.outcomeIntent) {
        continue;
      }
      
      // Filter by dialogue function if specified
      if (options.dialogueFunction && data.dialogueFunction !== options.dialogueFunction) {
        continue;
      }

      const semanticSim = this.cosineSimilarity(inputVec, data.vector);
      
      // PAD-aware scoring if target PAD provided
      let finalScore = semanticSim;
      if (options.targetPad && this.utterancePAD.has(id)) {
        const utterancePad = this.utterancePAD.get(id);
        const padSim = this.padSimilarity(options.targetPad, utterancePad);
        finalScore = (this.semanticSimilarityWeight * semanticSim) + 
                     (this.padSimilarityWeight * padSim);
      }

      similarities.push({
        id,
        similarity: finalScore,
        semanticSimilarity: semanticSim,
        outcomeIntent: data.outcomeIntent,
        dialogueFunction: data.dialogueFunction
      });
    }

    // Sort by similarity descending
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Get top K
    const topResults = similarities.slice(0, topK);
    const topIds = topResults.map(s => s.id);

    if (topIds.length === 0) {
      return { 
        results: [], 
        coverage: knownWords.length / allWords.length,
        inputWords: knownWords
      };
    }

    // Fetch full utterance data
    const result = await pool.query(`
      SELECT 
        te.training_example_id,
        te.utterance_text,
        te.dialogue_function_code,
        te.speech_act_code,
        te.pad_pleasure,
        te.pad_arousal,
        te.pad_dominance,
        toi.outcome_intent_code
      FROM ltlm_training_examples te
      LEFT JOIN ltlm_training_outcome_intents toi 
        ON te.training_example_id = toi.training_example_id
      WHERE te.training_example_id = ANY($1)
    `, [topIds]);

    // Map results with similarity scores
    const resultMap = new Map(result.rows.map(r => [r.training_example_id, r]));
    const results = topResults.map(s => ({
      ...resultMap.get(s.id),
      similarity: s.similarity,
      semanticSimilarity: s.semanticSimilarity
    }));

    return {
      results,
      coverage: knownWords.length / allWords.length,
      inputWords: knownWords,
      projectedToward: closestCentroid ? closestCentroid.key : null
    };
  }

  /**
   * Find the closest centroid to a vector
   * Used for runtime intent projection
   */
  findClosestCentroid(vec) {
    let best = null;
    let bestSim = -Infinity;

    // Check outcome-intent centroids (primary)
    for (const [key, centroid] of this.outcomeIntentCentroids.entries()) {
      const sim = this.cosineSimilarity(vec, centroid);
      if (sim > bestSim) {
        bestSim = sim;
        best = { key, vector: centroid, type: 'outcomeIntent', similarity: sim };
      }
    }

    return best;
  }

  /**
   * Get the semantic vector for arbitrary text
   */
  vectorize(text) {
    if (!this.trained) {
      throw new Error('[SemanticEmbedder] Not trained. Call train() first.');
    }

    const words = this.tokenize(text).filter(w => this.wordVectors.has(w));
    if (words.length === 0) return null;

    return this.normalize(
      this.averageVectors(words.map(w => this.wordVectors.get(w)))
    );
  }

  /**
   * Get similarity between two texts
   */
  similarity(text1, text2) {
    const vec1 = this.vectorize(text1);
    const vec2 = this.vectorize(text2);
    
    if (!vec1 || !vec2) return null;
    return this.cosineSimilarity(vec1, vec2);
  }

  /**
   * Calculate PAD similarity (1 - normalized distance)
   */
  padSimilarity(pad1, pad2) {
    const dp = pad1.p - pad2.p;
    const da = pad1.a - pad2.a;
    const dd = pad1.d - pad2.d;
    
    // Euclidean distance in PAD space, normalized to [0, 1]
    // Max possible distance is sqrt(4 + 4 + 4) = sqrt(12) ≈ 3.46 (if PAD ranges -1 to 1)
    const distance = Math.sqrt(dp*dp + da*da + dd*dd);
    const maxDistance = Math.sqrt(12);
    
    return 1 - (distance / maxDistance);
  }

  // ─────────────────────────────────────────────────────────────
  // INTERNAL METHODS
  // ─────────────────────────────────────────────────────────────

  tokenize(text) {
    const tokens = text
      .toLowerCase()
      .replace(/<subject>/gi, '')  // Remove placeholder
      .replace(/[\u2018\u2019'']/g, '')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
    
    // Optionally filter stop words
    if (this.filterStopWords) {
      return tokens.filter(w => !STOP_WORDS.has(w));
    }
    return tokens;
  }

  createMatrix(rows, cols) {
    return Array(rows).fill(null).map(() => new Float64Array(cols));
  }

  computePPMI(coocMatrix) {
    const n = coocMatrix.length;
    const ppmi = this.createMatrix(n, n);
    
    // Row and column sums
    const rowSums = new Float64Array(n);
    const colSums = new Float64Array(n);
    let total = 0;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        rowSums[i] += coocMatrix[i][j];
        colSums[j] += coocMatrix[i][j];
        total += coocMatrix[i][j];
      }
    }

    // PPMI calculation with epsilon to avoid log(0)
    const epsilon = 1e-10;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (coocMatrix[i][j] === 0) continue;
        
        const pij = coocMatrix[i][j] / (total + epsilon);
        const pi = rowSums[i] / (total + epsilon);
        const pj = colSums[j] / (total + epsilon);
        
        const pmi = Math.log2((pij + epsilon) / ((pi * pj) + epsilon));
        ppmi[i][j] = Math.max(0, pmi);  // Positive PMI only
      }
    }

    return ppmi;
  }

  /**
   * Truncated SVD via power iteration
   * Pure JS, no external dependencies
   */
  truncatedSVD(matrix, k) {
    const n = matrix.length;
    const result = Array(n).fill(null).map(() => new Float64Array(k));
    
    // Power iteration for top k singular vectors
    for (let dim = 0; dim < k; dim++) {
      // Initialize random vector (seeded for reproducibility)
      let v = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        v[i] = Math.sin(i * 12.9898 + dim * 78.233) * 43758.5453 % 1;
      }
      v = this.normalize(v);

      // Power iteration (30 iterations for better convergence)
      for (let iter = 0; iter < 30; iter++) {
        // v = A * A^T * v
        const Av = new Float64Array(n);
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            Av[i] += matrix[i][j] * v[j];
          }
        }
        
        const AtAv = new Float64Array(n);
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            AtAv[i] += matrix[j][i] * Av[j];
          }
        }

        // Deflate: remove components from previous dimensions
        for (let prevDim = 0; prevDim < dim; prevDim++) {
          const prevVec = new Float64Array(n);
          for (let i = 0; i < n; i++) {
            prevVec[i] = result[i][prevDim];
          }
          const dot = this.dot(AtAv, prevVec);
          for (let i = 0; i < n; i++) {
            AtAv[i] -= dot * prevVec[i];
          }
        }

        v = this.normalize(AtAv);
      }

      // Store this dimension
      for (let i = 0; i < n; i++) {
        result[i][dim] = v[i];
      }
    }

    return result;
  }

  averageVectors(vectors) {
    if (vectors.length === 0) return null;
    
    const dim = vectors[0].length;
    const avg = new Float64Array(dim);
    
    for (const vec of vectors) {
      for (let i = 0; i < dim; i++) {
        avg[i] += vec[i];
      }
    }
    
    for (let i = 0; i < dim; i++) {
      avg[i] /= vectors.length;
    }
    
    return avg;
  }

  shapeVector(original, centroid, alpha) {
    const dim = original.length;
    const shaped = new Float64Array(dim);
    
    for (let i = 0; i < dim; i++) {
      shaped[i] = alpha * original[i] + (1 - alpha) * centroid[i];
    }
    
    return shaped;
  }

  normalize(vec) {
    const norm = Math.sqrt(this.dot(vec, vec));
    if (norm === 0) return vec;
    
    const result = new Float64Array(vec.length);
    for (let i = 0; i < vec.length; i++) {
      result[i] = vec[i] / norm;
    }
    return result;
  }

  dot(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += a[i] * b[i];
    }
    return sum;
  }

  cosineSimilarity(a, b) {
    // Vectors are already normalized, so dot product = cosine
    return this.dot(a, b);
  }

  // ─────────────────────────────────────────────────────────────
  // DIAGNOSTICS
  // ─────────────────────────────────────────────────────────────

  getStats() {
    if (!this.trained) return null;

    return {
      ...this.trainingStats,
      maxVocabSize: this.maxVocabSize,
      shapingWeights: {
        alpha: this.alphaOriginal,
        beta: this.betaOutcomeIntent,
        gamma: this.gammaDialogueFunction
      },
      runtimeIntentProjection: this.runtimeIntentProjection,
      filterStopWords: this.filterStopWords,
      outcomeIntents: [...this.outcomeIntentCentroids.keys()],
      dialogueFunctions: [...this.dialogueFunctionCentroids.keys()]
    };
  }

  /**
   * Find words most similar to a given word
   */
  similarWords(word, topK = 5) {
    if (!this.trained) return null;
    
    const targetVec = this.wordVectors.get(word.toLowerCase());
    if (!targetVec) return null;

    const similarities = [];
    for (const [w, vec] of this.wordVectors.entries()) {
      if (w === word.toLowerCase()) continue;
      similarities.push({
        word: w,
        similarity: this.cosineSimilarity(targetVec, vec)
      });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK);
  }

  /**
   * Get nearest centroid for a given text (diagnostic)
   */
  getNearestCentroid(text) {
    if (!this.trained) return null;

    const vec = this.vectorize(text);
    if (!vec) return null;

    const closest = this.findClosestCentroid(vec);
    if (!closest) return null;

    return {
      centroid: closest.key,
      type: closest.type,
      similarity: closest.similarity
    };
  }

  /**
   * Audit semantic drift - compare word to its expected intent
   */
  auditWord(word) {
    if (!this.trained) return null;

    const similar = this.similarWords(word, 10);
    const nearest = this.getNearestCentroid(word);

    return {
      word,
      nearestCentroid: nearest,
      similarWords: similar
    };
  }

  /**
   * Get centroid details for an outcome intent
   */
  getCentroidInfo(outcomeIntent) {
    if (!this.trained) return null;
    
    const centroid = this.outcomeIntentCentroids.get(outcomeIntent);
    if (!centroid) return null;

    // Find utterances closest to this centroid
    const closest = [];
    for (const [id, data] of this.utteranceVectors.entries()) {
      if (data.outcomeIntent !== outcomeIntent) continue;
      const sim = this.cosineSimilarity(centroid, data.vector);
      closest.push({ id, similarity: sim });
    }
    closest.sort((a, b) => b.similarity - a.similarity);

    return {
      outcomeIntent,
      utteranceCount: closest.length,
      closestUtterances: closest.slice(0, 5)
    };
  }

  /**
   * Get dialogue function centroid details
   */
  getDialogueFunctionInfo(dialogueFunction) {
    if (!this.trained) return null;
    
    const centroid = this.dialogueFunctionCentroids.get(dialogueFunction);
    if (!centroid) return null;

    // Find utterances closest to this centroid
    const closest = [];
    for (const [id, data] of this.utteranceVectors.entries()) {
      if (data.dialogueFunction !== dialogueFunction) continue;
      const sim = this.cosineSimilarity(centroid, data.vector);
      closest.push({ id, similarity: sim });
    }
    closest.sort((a, b) => b.similarity - a.similarity);

    return {
      dialogueFunction,
      utteranceCount: closest.length,
      closestUtterances: closest.slice(0, 5)
    };
  }
}

export default new SemanticEmbedder();
