// COTW Intent Matcher - Pure database-driven intelligence
// No hardcoded data, no external APIs

class CotwIntentMatcher {
  constructor() {
    this.intents = {
      // CAN queries - requests and capabilities
      CAN: [
        /^can (?:you |i )(.+?)$/i,
        /^could (?:you |i )(.+?)$/i,
        /^would (?:you |i )(.+?)$/i,
        /^will (?:you |i )(.+?)$/i,
        /^please (.+?)$/i
      ],
      
      // WHO queries - character/entity identification
      WHO: [
        /^who is (.+?)$/i,
        /^who are the (.+?)$/i,
        /^tell me about (.+?)$/i,
        /^identify (.+?)$/i
      ],
      
      // WHAT queries - object/concept definition
      WHAT: [
        /^what is (.+?)$/i,
        /^what are (.+?)$/i,
        /^define (.+?)$/i,
        /^explain (.+?)$/i
      ],
      
      // WHEN queries - temporal information
      WHEN: [
        /^when did (.+?)$/i,
        /^when was (.+?)$/i,
        /^when will (.+?)$/i,
        /^what time (.+?)$/i
      ],
      
      // WHERE queries - spatial/location
      WHERE: [
        /^where is (.+?)$/i,
        /^where are (.+?)$/i,
        /^where did (.+?)$/i,
        /^location of (.+?)$/i
      ],
      
      // WHY queries - causality/reasoning
      WHY: [
        /^why did (.+?)$/i,
        /^why is (.+?)$/i,
        /^why does (.+?)$/i,
        /^reason for (.+?)$/i
      ],
      
      // HOW queries - process/method
      HOW: [
        /^how does (.+?)$/i,
        /^how did (.+?)$/i,
        /^how to (.+?)$/i,
        /^how is (.+?)$/i
      ],
      
      // SEARCH queries - comprehensive search
      SEARCH: [
        /^search for (.+?)$/i,
        /^find (.+?)$/i,
        /^lookup (.+?)$/i,
        /^query (.+?)$/i
      ]
    };
  }
  
  matchIntent(query) {
    const normalized = query.toLowerCase().trim();
    
    // Check CAN patterns first (most natural)
    if (normalized.match(/^(?:can|could|would|will|please)/i)) {
      // Extract the actual request
      let request = normalized;
      
      // Parse different CAN patterns
      if (normalized.match(/show.*picture/i)) {
        const match = normalized.match(/picture of (.+?)$/i);
        return {
          type: 'SHOW_IMAGE',
          entity: match ? match[1].trim() : 'unknown',
          confidence: 0.95,
          original: query
        };
      }
      
      if (normalized.match(/tell.*about/i)) {
        const match = normalized.match(/about (.+?)$/i);
        return {
          type: 'WHO',
          entity: match ? match[1].trim() : 'unknown',
          confidence: 0.95,
          original: query
        };
      }
      
      if (normalized.match(/learn.*about/i)) {
        const match = normalized.match(/about (.+?)$/i);
        return {
          type: 'WHAT',
          entity: match ? match[1].trim() : 'unknown',
          confidence: 0.95,
          original: query
        };
      }
      
      // Generic CAN pattern
      const match = normalized.match(/(?:can|could|would|will) (?:you |i )(.+?)$/i);
      if (match) {
        return {
          type: 'CAN',
          entity: match[1].trim(),
          confidence: 0.9,
          original: query
        };
      }
    }
    
    // Check other patterns
    for (const [intentType, patterns] of Object.entries(this.intents)) {
      for (const pattern of patterns) {
        const match = normalized.match(pattern);
        if (match) {
          return {
            type: intentType,
            entity: match[1] ? match[1].trim() : null,
            confidence: 0.95,
            original: query
          };
        }
      }
    }
    
    // Fallback to SEARCH if no pattern matches
    return {
      type: 'SEARCH',
      entity: normalized,
      confidence: 0.7,
      original: query
    };
  }
}

export default new CotwIntentMatcher();
