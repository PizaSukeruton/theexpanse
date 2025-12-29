/**
 * TanukiScribe.js
 * Generates new LTLM utterances by mutating existing ones.
 * "Evolution, not creation."
 */
import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';
import SemanticEmbedder from './SemanticEmbedder.js';
import padEstimator from './padEstimator.js';

class TanukiScribe {
  
  /**
   * Main entry point: Generates a variant for a specific intent
   * @param {string} trainingExampleId - The donor utterance ID
   * @param {object} targetPad - The desired emotional state {p, a, d}
   * @returns {object|null} The generated variant or null
   */
  async scribbleVariant(trainingExampleId, targetPad) {
    // Ensure dependencies are ready
    if (!SemanticEmbedder.trained) {
        console.log('[TanukiScribe] Waiting for SemanticEmbedder...');
        return null;
    }

    // 1. Fetch Donor Utterance
    const donor = await this.getUtterance(trainingExampleId);
    if (!donor) {
        console.log(`[TanukiScribe] Donor ${trainingExampleId} not found.`);
        return null;
    }

    console.log(`[TanukiScribe] Mutating: "${donor.text}"`);

    // 2. Tokenize and Identify Replaceable Words
    // Clean punctuation for word lookup, but keep original for reconstruction
    const words = donor.text.split(' ');
    
    let bestVariant = null;
    let bestScore = -Infinity;

    // Try mutating each word
    for (let i = 0; i < words.length; i++) {
      const originalWord = words[i].replace(/[^a-zA-Z]/g, '');
      
      // Skip short/functional words
      if (originalWord.length < 4) continue; 

      // 3. Find Semantic Neighbors (Synonyms in our corpus)
      const neighbors = await SemanticEmbedder.similarWords(originalWord, 8);
      if (!neighbors || neighbors.length === 0) continue;

      for (const candidate of neighbors) {
        // Skip identical words
        if (candidate.word.toLowerCase() === originalWord.toLowerCase()) continue;

        // 4. Construct Candidate Sentence
        // Replace the word in the array
        const newWords = [...words];
        // Preserve original punctuation if possible (simple regex swap)
        newWords[i] = words[i].replace(originalWord, candidate.word); 
        
        const newText = newWords.join(' ');

        // 5. Evaluate: Does it match the target PAD better?
        const newPadResult = padEstimator.estimate(newText);
        
        // Calculate distance to target (Fitness Function)
        const padScore = this.calculatePadMatch(
            { p: newPadResult.pad.pleasure, a: newPadResult.pad.arousal, d: newPadResult.pad.dominance }, 
            targetPad
        );
        
        // 6. Validate: Does it still mean the same thing?
        const semanticSim = SemanticEmbedder.similarity(donor.text, newText);
        
        // Gate: High semantic retention (>0.85) AND decent emotional match
        if (semanticSim > 0.85 && padScore > bestScore) {
          bestScore = padScore;
          bestVariant = {
            text: newText,
            pad: { 
                p: newPadResult.pad.pleasure, 
                a: newPadResult.pad.arousal, 
                d: newPadResult.pad.dominance 
            },
            original: donor.text,
            changed: `${originalWord} -> ${candidate.word}`,
            semanticScore: semanticSim,
            padScore: padScore
          };
        }
      }
    }

    // 7. Save if successful
    if (bestVariant) {
        console.log(`[TanukiScribe] Success! Changed "${bestVariant.changed}"`);
        console.log(` -> Old: ${donor.text}`);
        console.log(` -> New: ${bestVariant.text}`);
        await this.saveVariant(bestVariant, donor);
    } else {
        console.log('[TanukiScribe] No valid mutation found.');
    }
    
    return bestVariant;
  }

  /**
   * Euclidean distance inverted (1.0 = perfect match)
   */
  calculatePadMatch(actual, target) {
    const dist = Math.sqrt(
        Math.pow(actual.p - target.p, 2) +
        Math.pow(actual.a - target.a, 2) +
        Math.pow(actual.d - target.d, 2)
    );
    // Normalize roughly to 0-1 range (max dist in 2x2x2 cube is ~3.46)
    return 1 - (dist / 3.5);
  }

  async getUtterance(id) {
    const res = await pool.query(
        `SELECT training_example_id, utterance_text, 
                dialogue_function_code, speech_act_code 
         FROM ltlm_training_examples 
         WHERE training_example_id = $1`,
        [id]
    );
    if (res.rows.length === 0) return null;
    return {
        id: res.rows[0].training_example_id,
        text: res.rows[0].utterance_text,
        df: res.rows[0].dialogue_function_code,
        sa: res.rows[0].speech_act_code
    };
  }

  async saveVariant(variant, donor) {
    const newId = await generateHexId('ltlm_training_example_id');
    
    await pool.query(
        `INSERT INTO ltlm_training_examples 
         (training_example_id, speaker_character_id, utterance_text, 
          dialogue_function_code, speech_act_code, 
          pad_pleasure, pad_arousal, pad_dominance,
          source, is_canonical, difficulty, tags, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
            newId,
            '#700002', // Claude
            variant.text,
            donor.df,
            donor.sa,
            variant.pad.p,
            variant.pad.a,
            variant.pad.d,
            'tanuki_scribe_mutation',
            false, // Not canonical - needs approval or is experimental
            1,
            '{generated,scribe}',
            `Mutation of ${donor.id}: ${variant.changed}`,
            'TanukiScribe'
        ]
    );
    return newId;
  }
}

export default new TanukiScribe();
