// backend/services/storytellerWrapper.js
// LTLM Voice System - Storyteller Logic Layer
// Version: 2.0 (Synthesized from GPT/Gemini/Perplexity review)
// Date: 2025-12-17

import { chainPhrases } from './phraseChainer.js';

// ========================================
// SAFE CONNECTOR LIST
// These are additive/playful connectors only - NO causality
// Curated from database audit on 2025-12-17
// ========================================
const SAFE_CONNECTOR_HEX = [
  '#56002D', '#560153',  // "...and here's the bit that often trips people up..."
  '#56029C',             // "...and get this..."
  '#56029E',             // "...but wait, there's more..."
  '#560281',             // "...ooh, but here's where it gets interesting..."
  '#560029', '#56014F',  // "...and the important thing to note is..."
  '#56002C', '#560152',  // "...worth knowing too is that..."
  '#5600C6', '#5601EC'   // "...and just so you know..."
];

/**
 * Maps intent type to LTLM outcome/strategy pair.
 */
function mapIntentToStoryPlan(intentResult, emotionalSignal) {
  const baseType = intentResult?.type || 'WHAT';

  // Emotional overrides first
  if (emotionalSignal === 'anxious') {
    return { outcomeIntent: 'reassurance', strategy: 'affirmation' };
  }
  if (emotionalSignal === 'frustrated') {
    return { outcomeIntent: 'validation', strategy: 'reflection' };
  }

  // Intent-based mapping
  if (baseType === 'WHY') {
    return { outcomeIntent: 'exploration', strategy: 'question' };
  }
  
  // Default for WHO, WHAT, WHEN, HOW, WHERE, SHOW_IMAGE
  return { outcomeIntent: 'clarity', strategy: 'info' };
}

/**
 * Builds a storyteller-styled response using LTLM phrase assembly.
 * 
 * Assembly order (The Sandwich):
 *   Opener -> Content1 -> (Connector -> Content2)* -> Hedge -> Closer
 * 
 * @param {object} params
 * @param {object} params.intentResult - The parsed intent from cotwIntentMatcher
 * @param {string} params.emotionalSignal - 'neutral', 'anxious', 'frustrated', 'tired'
 * @param {string[]} params.contentBlocks - Array of content strings (preferred)
 * @param {string} params.knowledgeText - Single content string (legacy fallback)
 * @param {string} params.tone - 'neutral', 'playful', 'factual', 'warm'
 * @param {string} params.formality - 'casual', 'formal'
 * @returns {object} - { output, storytellerMeta }
 */
export async function buildStorytellerResponse({
  intentResult,
  emotionalSignal,
  contentBlocks,      // PREFERRED: Array of strings
  knowledgeText,      // LEGACY: Single string (backward compat)
  tone = 'neutral',
  formality = 'casual',
  outcomeIntent: overrideOutcomeIntent,  // Override for Omiyage etc
  strategy: overrideStrategy,              // Override for Omiyage etc
}) {
  // ========================================
  // 1. NORMALIZE CONTENT INTO BLOCKS
  // RULE: Block order MUST already be deterministic when passed in
  // storytellerWrapper does not infer or reorder semantics
  // ========================================
  let blocks = [];
  
  if (Array.isArray(contentBlocks) && contentBlocks.length > 0) {
    // Preferred: Explicit blocks passed by caller
    blocks = contentBlocks;
  } else if (knowledgeText) {
    // Legacy fallback: Treat as single block
    // NOTE: We do NOT split by \n\n here - that would create false multi-content
    blocks = [knowledgeText];
  } else {
    return { 
      output: '', 
      storytellerMeta: { 
        usedStoryteller: false, 
        reason: 'no_content' 
      } 
    };
  }
  
  // Clean blocks: trim whitespace, remove empties
  blocks = blocks.map(b => b.trim()).filter(b => b.length > 0);
  
  if (blocks.length === 0) {
    return { 
      output: '', 
      storytellerMeta: { 
        usedStoryteller: false, 
        reason: 'empty_content' 
      } 
    };
  }

  // ========================================
  // 2. MAP INTENT TO LTLM PARAMS
  // ========================================
  const derived = mapIntentToStoryPlan(intentResult, emotionalSignal);
  const outcomeIntent = overrideOutcomeIntent || derived.outcomeIntent;
  const strategy = overrideStrategy || derived.strategy;

  try {
    // ========================================
    // 3. DETERMINE CONNECTOR NEEDS
    // RULE: Connectors ONLY when blocks.length > 1
    // ========================================
    const numConnectorsNeeded = Math.max(0, blocks.length - 1);
    const skipConnectors = numConnectorsNeeded === 0;

    // ========================================
    // 4. FETCH PHRASES
    // Pass safe connector list to enforce safety
    // ========================================
    const chainResult = await chainPhrases(outcomeIntent, strategy, {
      tone,
      formality,
      connectorCount: numConnectorsNeeded,
      skipConnectors,
      safeConnectorHex: SAFE_CONNECTOR_HEX  // ENFORCE SAFETY
    });

    const chain = chainResult.chain;
    
    // ========================================
    // 5. ASSEMBLE OUTPUT (THE SANDWICH)
    // Order: Opener -> Content -> Connector -> Content -> ... -> Hedge -> Closer
    // ========================================
    let finalOutput = "";

    // A. TOP BUN (Opener)
    if (chain.opener) {
      finalOutput += `${chain.opener} `;
    }

    // B. MEAT & CHEESE (Content + Connectors)
    blocks.forEach((block, index) => {
      finalOutput += block;

      // Add connector between blocks (not after last)
      if (index < blocks.length - 1) {
        if (chain.connectors && chain.connectors[index]) {
          finalOutput += ` ${chain.connectors[index]} `;
        } else {
          // Fallback if no connector available
          finalOutput += " ";
        }
      }
    });

    // C. GARNISH (Hedge) - epistemic softener, goes before closer
    if (chain.hedge) {
      finalOutput += ` ${chain.hedge}`;
    }

    // D. BOTTOM BUN (Closer)
    if (chain.closer) {
      const lastChar = finalOutput.trim().slice(-1);
      if (!['.', '!', '?'].includes(lastChar)) {
        finalOutput += '.';
      }
      finalOutput += ` ${chain.closer}`;
    }

    return {
      output: finalOutput.trim(),
      storytellerMeta: {
        usedStoryteller: true,
        outcomeIntent,
        strategy,
        tone,
        formality,
        blockCount: blocks.length,
        phraseIds: chainResult?.metadata?.phraseIds,
        structureCode: chain.structureCode
      },
    };

  } catch (err) {
    console.warn(`[Storyteller] Error: ${err.message}. Returning raw content.`);
    return {
      output: blocks.join('\n\n'),
      storytellerMeta: { 
        usedStoryteller: false, 
        reason: 'chainPhrases_error',
        error: err.message 
      }
    };
  }
}
