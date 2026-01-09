import pool from '../db/pool.js';

/**
 * Finds semantically similar utterances from the canonical LTLM training examples.
 * Uses TF-IDF vectorization with Cosine similarity for text matching.
 * Optionally weights by normalized PAD Euclidean distance if targetPad provided.
 * 
 * Example usage:
 * const results = await findSemanticUtterances("It's fine, no rush", { topK: 5, targetPad: { p: 0.05, a: -0.02, d: -0.1 } });
 */
export async function findSemanticUtterances(inputText, options = {}) {
  const topK = options.topK || 3;
  let targetPad = options.targetPad || { p: 0, a: 0, d: 0 };

  if (!inputText || typeof inputText !== 'string' || inputText.trim() === '') {
    return {
      results: [],
      coverage: 0,
      inputLength: 0
    };
  }

  const client = await pool.connect();
  try {
    // Tokenize input
    const inputTokens = tokenize(inputText);
    const inputLength = inputTokens.length;
    if (inputLength === 0) {
      return {
        results: [],
        coverage: 0,
        inputLength: 0
      };
    }

    // Query canonical utterances for Claude
    const query = `
      SELECT training_example_id, utterance_text, pad_pleasure, pad_arousal, pad_dominance
      FROM ltlm_training_examples
      WHERE is_canonical = true AND speaker_character_id = '700002'
    `;
    const result = await client.query(query);
    const rows = result.rows;

    if (rows.length === 0) {
      return {
        results: [],
        coverage: 0,
        inputLength
      };
    }

    const N = rows.length;

    // Precompute tokenized utterances
    const tokenizedUtterances = rows.map(row => tokenize(row.utterance_text));

    // Compute DF for IDF
    const df = new Map();
    tokenizedUtterances.forEach(utt => {
      new Set(utt).forEach(word => {
        df.set(word, (df.get(word) || 0) + 1);
      });
    });

    // Coverage: fraction of input tokens in corpus
    const knownInputTokens = inputTokens.filter(word => df.has(word)).length;
    const coverage = inputLength > 0 ? knownInputTokens / inputLength : 0;

    // TF-IDF vectorizer function
    const getTfIdfVector = (tokens) => {
      const tf = new Map();
      tokens.forEach(w => tf.set(w, (tf.get(w) || 0) + 1));
      const vec = new Map();
      const len = tokens.length;
      tf.forEach((count, word) => {
        const tfVal = count / len;
        const idfVal = Math.log(N / (df.get(word) || 1)) + 1;
        vec.set(word, tfVal * idfVal);
      });
      return vec;
    };

    // Input vector and norm
    const inputVec = getTfIdfVector(inputTokens);
    let inputNorm = 0;
    inputVec.forEach(v => inputNorm += v * v);
    inputNorm = Math.sqrt(inputNorm);

    // Precompute utterance TF-IDF vectors and norms
    const tfidfVectors = tokenizedUtterances.map(tokens => {
      if (tokens.length === 0) {
        console.warn('[findSemanticUtterances] Empty tokenized utterance');
        return new Map();
      }
      return getTfIdfVector(tokens);
    });
    const tfidfNorms = tfidfVectors.map(vec => {
      let norm = 0;
      vec.forEach(v => norm += v * v);
      return Math.sqrt(norm);
    });

    // Compute similarities
    const similarities = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const uttTokens = tokenizedUtterances[i];
      if (uttTokens.length === 0) continue;

      const uttVec = tfidfVectors[i];
      const uttNorm = tfidfNorms[i];

      // Cosine similarity
      let dot = 0;
      inputVec.forEach((v, word) => {
        dot += v * (uttVec.get(word) || 0);
      });
      let sim = (inputNorm > 0 && uttNorm > 0) ? dot / (inputNorm * uttNorm) : 0;

      // Weight by PAD
      const uttPad = {
        p: parseFloat(row.pad_pleasure),
        a: parseFloat(row.pad_arousal),
        d: parseFloat(row.pad_dominance)
      };
      const dist = padDistance(uttPad, targetPad);
      const padSim = 1 - dist;
      sim = sim * 0.7 + padSim * 0.3;

      similarities.push({
        utterance_text: row.utterance_text,
        similarity: Math.max(0, Math.min(1, sim)),
        pad: uttPad,
        training_example_id: row.training_example_id
      });
    }

    // Sort: primary by similarity desc, secondary by PAD distance asc if tie
    similarities.sort((a, b) => {
      if (b.similarity !== a.similarity) {
        return b.similarity - a.similarity;
      }
      return padDistance(a.pad, targetPad) - padDistance(b.pad, targetPad);
    });

    const topResults = similarities.slice(0, topK);

    return {
      results: topResults,
      coverage,
      inputLength
    };
  } catch (error) {
    console.error('[findSemanticUtterances] Error:', error);
    return {
      results: [],
      coverage: 0,
      inputLength: 0
    };
  } finally {
    client.release();
  }
}

// Tokenization function (exact pattern from padEstimator.js)
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, '') // smart quotes
    .replace(/['']/g, '') // straight quotes, matching exact
    .replace(/[^a-z0-9\s-]/g, ' ') // remove special chars
    .split(/\s+/) // split on whitespace
    .filter(w => w.length > 2); // minimum 3 characters
}

// Normalized PAD distance (0-1)
function padDistance(pad1, pad2) {
  const dp = pad1.p - pad2.p;
  const da = pad1.a - pad2.a;
  const dd = pad1.d - pad2.d;
  return Math.sqrt(dp * dp + da * da + dd * dd) / Math.sqrt(12); // Max ~3.46 for [-1,1]
}
