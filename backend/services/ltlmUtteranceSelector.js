/**
 * ltlmUtteranceSelector.js
 * 
 * Selects LTLM utterances for Claude the Tanuki to speak.
 * 
 * Strategy (v2 - Tiered Constraint Relaxation):
 *   1. Try tiered matching - progressively relax constraints until ≥30 candidates
 *   2. Always enhance with semantic search (not just as fallback)
 *   3. Rank by PAD similarity + semantic similarity + novelty penalty
 *   4. Random selection from top candidates for variety
 * 
 * Tiers:
 *   T1: speaker + speech_act + dialogue_function + outcome_intent
 *   T2: speaker + dialogue_function + outcome_intent
 *   T3: speaker + dialogue_function
 *   T4: speaker + speech_act
 *   T5: speaker only
 */

import pool from '../db/pool.js';
import semanticEmbedder from './SemanticEmbedder.js';

// Track recent utterance usage for novelty penalty (in-memory, resets on restart)
const recentUtterances = new Map();
const NOVELTY_WINDOW = 50;
const NOVELTY_DECAY = 0.95;

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
  const MIN_CANDIDATES = 10;
  
  try {
    const { pleasure, arousal, dominance } = targetPad;
    let candidates = [];
    let tierUsed = 0;

    // Define the tiered queries - progressively relax constraints
    const tiers = [
      {
        name: 'T1: Full Match',
        conditions: `
          e.speaker_character_id = $1
          AND e.speech_act_code = $2
          AND e.dialogue_function_code = $3
          AND oi.outcome_intent_code = $4
        `,
        params: [speakerCharacterId, speechActCode, dialogueFunctionCode, outcomeIntentCode],
        padStartIndex: 5
      },
      {
        name: 'T2: Drop Speech Act',
        conditions: `
          e.speaker_character_id = $1
          AND e.dialogue_function_code = $2
          AND oi.outcome_intent_code = $3
        `,
        params: [speakerCharacterId, dialogueFunctionCode, outcomeIntentCode],
        padStartIndex: 4
      },
      {
        name: 'T3: Speaker + Dialogue Function',
        conditions: `
          e.speaker_character_id = $1
          AND e.dialogue_function_code = $2
        `,
        params: [speakerCharacterId, dialogueFunctionCode],
        padStartIndex: 3
      },
      {
        name: 'T4: Speaker + Speech Act',
        conditions: `
          e.speaker_character_id = $1
          AND e.speech_act_code = $2
        `,
        params: [speakerCharacterId, speechActCode],
        padStartIndex: 3
      },
      {
        name: 'T5: Speaker Only',
        conditions: `
          e.speaker_character_id = $1
        `,
        params: [speakerCharacterId],
        padStartIndex: 2
      }
    ];

    // Try each tier until we get enough candidates
    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      tierUsed = i + 1;

      // Skip tier if required params are null
      if (tier.params.some(p => p === null || p === undefined)) {
        continue;
      }

      const pIdx = tier.padStartIndex;
      const tierSql = `
        SELECT
          e.training_example_id,
          e.utterance_text,
          e.pad_pleasure,
          e.pad_arousal,
          e.pad_dominance,
          e.dialogue_function_code,
          e.speech_act_code,
          oi.outcome_intent_code
        FROM ltlm_training_examples e
        LEFT JOIN ltlm_training_outcome_intents oi
          ON oi.training_example_id = e.training_example_id
        WHERE ${tier.conditions}
        ORDER BY
          (e.pad_pleasure - $${pIdx}) * (e.pad_pleasure - $${pIdx})
          + (e.pad_arousal - $${pIdx + 1}) * (e.pad_arousal - $${pIdx + 1})
          + (e.pad_dominance - $${pIdx + 2}) * (e.pad_dominance - $${pIdx + 2})
        LIMIT 50
      `;

      const tierParams = [...tier.params, pleasure, arousal, dominance];
      const tierResult = await client.query(tierSql, tierParams);
      candidates = tierResult.rows;

      if (candidates.length >= MIN_CANDIDATES) {
        break;
      }
    }

    // Step 2: Always enhance with semantic search
    if (semanticEmbedder.trained) {
      try {
        const searchText = contextText || buildSearchText(dialogueFunctionCode, outcomeIntentCode, speechActCode);
        
        if (searchText) {
          const semanticResults = await semanticEmbedder.findSimilar(searchText, 15, {
            outcomeIntent: outcomeIntentCode || undefined,
            dialogueFunction: dialogueFunctionCode || undefined,
            targetPad: { p: pleasure, a: arousal, d: dominance }
          });

          if (semanticResults.results && semanticResults.results.length > 0) {
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
                  speech_act_code: semResult.speech_act_code,
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
        console.warn('[ltlmUtteranceSelector] Semantic enhancement failed:', semError.message);
      }
    }

    // Cap candidates to prevent scoring cost blowup
    if (candidates.length > 150) {
      candidates = candidates.slice(0, 150);
    }

    // Step 3: No candidates at all - return null
    if (candidates.length === 0) {
      console.warn('[ltlmUtteranceSelector] No candidates found at any tier');
      return null;
    }

    // Step 4: Score and rank candidates with novelty penalty
    const scoredCandidates = candidates.map(row => {
      // PAD distance (lower is better, so invert for score)
      const padDistance = Math.sqrt(
        Math.pow((row.pad_pleasure || 0) - pleasure, 2) +
        Math.pow((row.pad_arousal || 0) - arousal, 2) +
        Math.pow((row.pad_dominance || 0) - dominance, 2)
      );
      const maxPadDistance = Math.sqrt(12);
      const padScore = 1 - (padDistance / maxPadDistance);

      // Semantic score (if available)
      const semanticScore = row.semantic_similarity || 0;

      // Novelty score (penalize recently used utterances)
      const usage = recentUtterances.get(row.training_example_id);
      const noveltyScore = usage ? 1 / (1 + usage.count) : 1;

      // Combined score: PAD 0.5, Semantic 0.3, Novelty 0.2
      const combinedScore = row.source === 'semantic'
        ? (0.5 * padScore) + (0.3 * semanticScore) + (0.2 * noveltyScore)
        : (0.6 * padScore) + (0.2 * noveltyScore) + (0.2 * (row.outcome_intent_code ? 1 : 0.5));

      return {
        ...row,
        padScore,
        semanticScore,
        noveltyScore,
        combinedScore
      };
    });

    // Sort by combined score
    scoredCandidates.sort((a, b) => b.combinedScore - a.combinedScore);

    // Step 5: Random selection from top 10 for variety
    const topCandidates = scoredCandidates.slice(0, Math.min(10, scoredCandidates.length));
    const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];

    // Update novelty tracking
    updateNoveltyTracking(selected.training_example_id);

    return {
      trainingExampleId: selected.training_example_id,
      utteranceText: selected.utterance_text,
      pad: {
        pleasure: selected.pad_pleasure,
        arousal: selected.pad_arousal,
        dominance: selected.pad_dominance
      },
      dialogueFunction: selected.dialogue_function_code,
      speechAct: selected.speech_act_code,
      outcomeIntent: selected.outcome_intent_code,
      scores: {
        pad: selected.padScore,
        semantic: selected.semanticScore,
        novelty: selected.noveltyScore,
        combined: selected.combinedScore
      },
      source: selected.source || 'exact',
      tierUsed: tierUsed,
      candidatePoolSize: candidates.length
    };
  } finally {
    client.release();
  }
}

/**
 * Update novelty tracking for a selected utterance
 */
function updateNoveltyTracking(trainingExampleId) {
  // Decay all existing counts
  for (const [id, data] of recentUtterances.entries()) {
    data.count *= NOVELTY_DECAY;
    if (data.count < 0.1) {
      recentUtterances.delete(id);
    }
  }

  // Update selected utterance
  const existing = recentUtterances.get(trainingExampleId);
  if (existing) {
    existing.count += 1;
    existing.lastUsed = Date.now();
  } else {
    recentUtterances.set(trainingExampleId, { count: 1, lastUsed: Date.now() });
  }

  // Trim to window size
  if (recentUtterances.size > NOVELTY_WINDOW * 2) {
    const oldest = [...recentUtterances.entries()]
      .sort((a, b) => a[1].lastUsed - b[1].lastUsed)
      .slice(0, recentUtterances.size - NOVELTY_WINDOW);
    oldest.forEach(([id]) => recentUtterances.delete(id));
  }
}

/**
 * Build search text from parameters for semantic matching
 */
function buildSearchText(dialogueFunctionCode, outcomeIntentCode, speechActCode) {
  const parts = [];
  
  if (dialogueFunctionCode) {
    const func = dialogueFunctionCode.split('.').pop();
    parts.push(func);
  }
  
  if (outcomeIntentCode) {
    const outcome = outcomeIntentCode.split('.').pop().replace(/_/g, ' ');
    parts.push(outcome);
  }
  
  if (speechActCode) {
    const act = speechActCode.split('.').pop();
    if (!parts.includes(act)) {
      parts.push(act);
    }
  }
  
  return parts.length > 0 ? parts.join(' ') : null;
}

/**
 * Direct semantic search for utterances
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

/**
 * Get novelty tracking stats (for debugging/monitoring)
 */
export function getNoveltyStats() {
  return {
    trackedUtterances: recentUtterances.size,
    windowSize: NOVELTY_WINDOW,
    decayFactor: NOVELTY_DECAY,
    entries: [...recentUtterances.entries()].map(([id, data]) => ({
      id,
      count: data.count.toFixed(2),
      lastUsed: new Date(data.lastUsed).toISOString()
    }))
  };
}
