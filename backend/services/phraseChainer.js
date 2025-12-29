// backend/services/phraseChainer.js
// LTLM Voice System - Phrase Assembly Engine
// Version: 2.0 (Synthesized from GPT/Gemini/Perplexity review)
// Date: 2025-12-17

import { getPhrases } from './phraseQueryLayer.js';

/**
 * Orchestrates the retrieval of phrase components for voice styling.
 * Returns structured parts for "sandwich" assembly.
 * 
 * @param {string} outcomeIntent - e.g., 'clarity', 'validation', 'reassurance'
 * @param {string} strategy - e.g., 'info', 'question', 'affirmation'
 * @param {object} options - Configuration options
 * @returns {object} - { success, chain, metadata }
 */
async function chainPhrases(outcomeIntent, strategy, options = {}) {
  const {
    tone = null,
    formality = 'casual',
    connectorCount = null,
    skipConnectors = false,  // GATE: Explicitly disable connectors
    safeConnectorHex = null, // Filter: Only fetch these connector IDs
    randomOrder = true
  } = options;

  try {
    // ========================================
    // RULE 1: skipConnectors ALWAYS overrides connectorCount
    // This is non-negotiable. If skipConnectors is true,
    // we do NOT query connectors at all.
    // ========================================
    
    // 1. Fetch Opener (Required)
    let openerResult = await getPhrases(outcomeIntent, strategy, {
      role: 'opener',
      tone,
      formality,
      limit: 1,
      randomOrder
    });

    // Fallback: If specific tone missing, try neutral
    if (!openerResult.found) {
      openerResult = await getPhrases(outcomeIntent, strategy, {
        role: 'opener',
        tone: 'neutral',
        limit: 1
      });
    }

    // Deep fallback: Generic opener if even neutral fails
    if (!openerResult.found) {
      console.warn(`[phraseChainer] No opener found for ${outcomeIntent}/${strategy}, using fallback`);
      openerResult = { 
        found: true, 
        phrases: [{ 
          text: "Here's what I found:", 
          phrase_hex_id: "FALLBACK_OPENER" 
        }] 
      };
    }

    const opener = openerResult.phrases[0];

    // 2. Fetch Connectors (Conditional & Gated)
    let connectors = [];
    
    // ENFORCEMENT: skipConnectors takes absolute precedence
    if (!skipConnectors) {
      let targetCount = connectorCount ?? 1;
      
      if (targetCount > 0) {
        const connectorResult = await getPhrases(outcomeIntent, strategy, {
          role: 'connector',
          tone,
          formality,
          limit: targetCount,
          randomOrder,
          hexList: safeConnectorHex  // Only fetch safe IDs if provided
        });
        
        if (connectorResult.found) {
          connectors = connectorResult.phrases.slice(0, targetCount);
        }
      }
    }
    // If skipConnectors === true, connectors remains []

    // 3. Fetch Closer (Optional)
    let closer = null;
    const closerResult = await getPhrases(outcomeIntent, strategy, {
      role: 'closer',
      tone,
      formality,
      limit: 1,
      randomOrder
    });

    if (closerResult.found) {
      closer = closerResult.phrases[0];
    }

    // 4. Fetch Hedge (Optional - 50% chance)
    // RULE: Hedge randomization stays in phraseChainer only
    let hedge = null;
    const hedgeResult = await getPhrases(outcomeIntent, strategy, {
      role: 'hedge',
      tone,
      formality,
      limit: 1,
      randomOrder
    });

    if (hedgeResult.found && Math.random() > 0.5) {
      hedge = hedgeResult.phrases[0];
    }

    // 5. Build and Return Structured Chain
    const chain = buildChain(opener, connectors, closer, hedge);

    return {
      success: true,
      chain,
      metadata: {
        outcomeIntent,
        strategy,
        tone: tone || 'any',
        formality,
        phraseIds: {
          opener: opener.phrase_hex_id,
          connectors: connectors.map(c => c.phrase_hex_id),
          closer: closer ? closer.phrase_hex_id : null,
          hedge: hedge ? hedge.phrase_hex_id : null
        }
      }
    };

  } catch (error) {
    console.error(`[phraseChainer] Error:`, error.message);
    throw error;
  }
}

/**
 * Builds the chain structure from phrase components.
 * Returns STRUCTURED PARTS for assembly, not pre-assembled text.
 * 
 * IMPORTANT: The 'text' field is LEGACY ONLY.
 * New code MUST use the structured parts (opener, connectors, hedge, closer).
 */
function buildChain(opener, connectors = [], closer = null, hedge = null) {
  return {
    // ========================================
    // STRUCTURED PARTS - Use these for assembly
    // ========================================
    opener: opener ? opener.text.trim() : null,
    connectors: connectors.map(c => c.text.trim()),
    hedge: hedge ? hedge.text.trim() : null,
    closer: closer ? closer.text.trim() : null,

    // ========================================
    // LEGACY FIELD - Do NOT use for new logic
    // Kept only for backward compatibility and debugging
    // ========================================
    text: [
      opener?.text, 
      ...connectors.map(c => c.text), 
      hedge?.text, 
      closer?.text
    ].filter(Boolean).join(' ').trim(),
    
    // Debug: Shows assembly structure
    structureCode: generateStructureCode(opener, connectors, closer, hedge)
  };
}

/**
 * Generates a debug code showing the chain structure.
 * e.g., "O-C-H-CL" = Opener, Connector, Hedge, Closer
 */
function generateStructureCode(opener, connectors, closer, hedge) {
  const codes = [];
  if (opener) codes.push('O');
  connectors.forEach(() => codes.push('C'));
  if (hedge) codes.push('H');
  if (closer) codes.push('CL');
  return codes.join('-');
}

export { chainPhrases, buildChain };
