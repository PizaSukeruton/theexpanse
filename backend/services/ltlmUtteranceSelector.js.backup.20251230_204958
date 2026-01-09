/**
 * ltlmUtteranceSelector.js
 * 
 * Selects LTLM utterances for Claude the Tanuki to speak.
 * 
 * Strategy:
 *   1. Try exact match (speaker, speech_act, dialogue_function, outcome_intent)
 *   2. If few results, enhance with semantic search
 *   3. Rank by PAD similarity + semantic similarity
 *   4. Random selection from top candidates for variety
 */

import pool from '../db/pool.js';
import semanticEmbedder from './SemanticEmbedder.js';

/**
 * Select an LTLM utterance for a narrative beat
 * 
 * @param {object} params
 * @param {string} params.speakerCharacterId - Who is speaking
 * @param {string} params.speechActCode - The speech act type
 * @param {string} params.dialogueFunctionCode - The dialogue function
 * @param {string} params.outcomeIntentCode - The intended outcome
 * @param {object} params.targetPad - Target emotional state {pleasure, arousal, dominance}
 * @param {string} params.contextText - Optional context for semantic matching
 * @returns {object|null} Selected utterance or null
 */
export async function selectLtlmUtteranceForBeat({
  speakerCharacterId,
  speechActCode,
  dialogueFunctionCode,
  outcomeIntentCode,
  targetPad,
  contextText = null
}) {
  const client = await pool.connect();
  try {
    const { pleasure, arousal, dominance } = targetPad;

    // Step 1: Try exact match (original behavior)
    const exactSql = `
      SELECT
        e.training_example_id,
        e.utterance_text,
        e.pad_pleasure,
        e.pad_arousal,
        e.pad_dominance,
        e.dialogue_function_code,
        oi.outcome_intent_code
      FROM ltlm_training_examples e
      LEFT JOIN ltlm_training_outcome_intents oi
        ON oi.training_example_id = e.training_example_id
      WHERE
        ($1::text IS NULL OR e.speaker_character_id = $1)
        AND ($2::text IS NULL OR e.speech_act_code = $2)
        AND ($3::text IS NULL OR e.dialogue_function_code = $3)
        AND ($4::text IS NULL OR oi.outcome_intent_code = $4)
      ORDER BY
        ((e.pad_pleasure - $5)::double precision * (e.pad_pleasure - $5)::double precision)
        + ((e.pad_arousal - $6)::double precision * (e.pad_arousal - $6)::double precision)
        + ((e.pad_dominance - $7)::double precision * (e.pad_dominance - $7)::double precision)
      LIMIT 20
    `;

    const exactParams = [
      speakerCharacterId || null,
      speechActCode || null,
      dialogueFunctionCode || null,
      outcomeIntentCode || null,
      pleasure,
      arousal,
      dominance
    ];

    const exactResult = await client.query(exactSql, exactParams);
    let candidates = exactResult.rows;

    // Step 2: If we have context and semantic embedder is trained, enhance with semantic search
    if (semanticEmbedder.trained && (contextText || candidates.length < 5)) {
      try {
        // Build search text from context or parameters
        const searchText = contextText || buildSearchText(dialogueFunctionCode, outcomeIntentCode, speechActCode);
        
        if (searchText) {
          const semanticResults = await semanticEmbedder.findSimilar(searchText, 10, {
            outcomeIntent: outcomeIntentCode || undefined,
            dialogueFunction: dialogueFunctionCode || undefined,
            targetPad: { p: pleasure, a: arousal, d: dominance }
          });

          if (semanticResults.results && semanticResults.results.length > 0) {
            // Merge semantic results with exact matches
            const existingIds = new Set(candidates.map(c => c.training_example_id));
            
            for (const semResult of semanticResults.results) {
              if (!existingIds.has(semResult.training_example_id)) {
                candidates.push({
                  training_example_id: semResult.training_example_id,
                  utterance_text: semResult.utterance_text,
                  pad_pleasure: semResult.pad_pleasure,
                  pad_arousal: semResult.pad_arousal,
                  pad_dominance: semResult.pad_dominance,
                  dialogue_function_code: semResult.dialogue_function_code,
                  outcome_intent_code: semResult.outcome_intent_code,
                  semantic_similarity: semResult.similarity,
                  source: 'semantic'
                });
                existingIds.add(semResult.training_example_id);
              }
            }
          }
        }
      } catch (semError) {
        // Semantic search failed, continue with exact matches only
        console.warn('[ltlmUtteranceSelector] Semantic fallback failed:', semError.message);
      }
    }

    // Step 3: If still no candidates, try broader search (relax constraints)
    if (candidates.length === 0) {
      const broadSql = `
        SELECT
          e.training_example_id,
          e.utterance_text,
          e.pad_pleasure,
          e.pad_arousal,
          e.pad_dominance,
          e.dialogue_function_code,
          oi.outcome_intent_code
        FROM ltlm_training_examples e
        LEFT JOIN ltlm_training_outcome_intents oi
          ON oi.training_example_id = e.training_example_id
        WHERE
          ($1::text IS NULL OR e.dialogue_function_code = $1)
          OR ($2::text IS NULL OR oi.outcome_intent_code = $2)
        ORDER BY
          ((e.pad_pleasure - $3)::double precision * (e.pad_pleasure - $3)::double precision)
          + ((e.pad_arousal - $4)::double precision * (e.pad_arousal - $4)::double precision)
          + ((e.pad_dominance - $5)::double precision * (e.pad_dominance - $5)::double precision)
        LIMIT 20
      `;

      const broadParams = [
        dialogueFunctionCode || null,
        outcomeIntentCode || null,
        pleasure,
        arousal,
        dominance
      ];

      const broadResult = await client.query(broadSql, broadParams);
      candidates = broadResult.rows;
    }

    // Step 4: No candidates at all
    if (candidates.length === 0) {
      return null;
    }

    // Step 5: Score and rank candidates
    const scoredCandidates = candidates.map(row => {
      // PAD distance (lower is better, so invert for score)
      const padDistance = Math.sqrt(
        Math.pow((row.pad_pleasure || 0) - pleasure, 2) +
        Math.pow((row.pad_arousal || 0) - arousal, 2) +
        Math.pow((row.pad_dominance || 0) - dominance, 2)
      );
      const maxPadDistance = Math.sqrt(12); // Max possible distance
      const padScore = 1 - (padDistance / maxPadDistance);

      // Semantic score (if available)
      const semanticScore = row.semantic_similarity || 0;

      // Combined score: PAD weight 0.6, Semantic weight 0.4
      const combinedScore = row.source === 'semantic'
        ? (0.6 * padScore) + (0.4 * semanticScore)
        : padScore;

      return {
        ...row,
        padScore,
        semanticScore,
        combinedScore
      };
    });

    // Sort by combined score
    scoredCandidates.sort((a, b) => b.combinedScore - a.combinedScore);

    // Step 6: Random selection from top 5 for variety
    const topCandidates = scoredCandidates.slice(0, Math.min(5, scoredCandidates.length));
    const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];

    return {
      trainingExampleId: selected.training_example_id,
      utteranceText: selected.utterance_text,
      pad: {
        pleasure: selected.pad_pleasure,
        arousal: selected.pad_arousal,
        dominance: selected.pad_dominance
      },
      dialogueFunction: selected.dialogue_function_code,
      outcomeIntent: selected.outcome_intent_code,
      scores: {
        pad: selected.padScore,
        semantic: selected.semanticScore,
        combined: selected.combinedScore
      },
      source: selected.source || 'exact'
    };
  } finally {
    client.release();
  }
}

/**
 * Build search text from parameters for semantic matching
 */
function buildSearchText(dialogueFunctionCode, outcomeIntentCode, speechActCode) {
  const parts = [];
  
  // Convert codes to natural language hints
  if (dialogueFunctionCode) {
    // e.g., "expressive.encourage" -> "encourage"
    const func = dialogueFunctionCode.split('.').pop();
    parts.push(func);
  }
  
  if (outcomeIntentCode) {
    // e.g., "emotional_outcomes.reduce_distress" -> "reduce distress"
    const outcome = outcomeIntentCode.split('.').pop().replace(/_/g, ' ');
    parts.push(outcome);
  }
  
  if (speechActCode) {
    // e.g., "expressive.comfort" -> "comfort"
    const act = speechActCode.split('.').pop();
    if (!parts.includes(act)) {
      parts.push(act);
    }
  }
  
  return parts.length > 0 ? parts.join(' ') : null;
}

/**
 * Direct semantic search for utterances
 * Use when you have user input text and want to find similar LTLM responses
 * 
 * @param {string} inputText - The text to match against
 * @param {object} options - Optional filters
 * @returns {object} Search results
 */
export async function findSemanticUtterances(inputText, options = {}) {
  if (!semanticEmbedder.trained) {
    console.warn('[ltlmUtteranceSelector] SemanticEmbedder not trained');
    return { results: [], coverage: 0 };
  }

  return semanticEmbedder.findSimilar(inputText, options.topK || 5, {
    outcomeIntent: options.outcomeIntentCode,
    dialogueFunction: options.dialogueFunctionCode,
    targetPad: options.targetPad
  });
}
