class CotwIntentMatcher {
  constructor() {
    this.intents = {
      CAN: [
        /^can (?:you |i )(.+?)$/i,
        /^could (?:you |i )(.+?)$/i,
        /^would (?:you |i )(.+?)$/i,
        /^will (?:you |i )(.+?)$/i,
        /^please (.+?)$/i
      ],
      
      WHO: [
        /^who is (.+?)$/i,
        /^who are the (.+?)$/i,
        /^tell me about (.+?)$/i,
        /^identify (.+?)$/i
      ],
      
      WHAT: [
        /^what is (.+?)$/i,
        /^what are (.+?)$/i,
        /^define (.+?)$/i,
        /^explain (.+?)$/i
      ],
      
      WHEN: [
        /^when did (.+?)$/i,
        /^when was (.+?)$/i,
        /^when will (.+?)$/i,
        /^what time (.+?)$/i
      ],
      
      WHERE: [
        /^where is (.+?)$/i,
        /^where are (.+?)$/i,
        /^where did (.+?)$/i,
        /^location of (.+?)$/i
      ],
      
      WHY: [
        /^why did (.+?)$/i,
        /^why is (.+?)$/i,
        /^why does (.+?)$/i,
        /^reason for (.+?)$/i
      ],
      
      HOW: [
        /^how does (.+?)$/i,
        /^how did (.+?)$/i,
        /^how to (.+?)$/i,
        /^how is (.+?)$/i
      ],
      
      SEARCH: [
        /^search for (.+?)$/i,
        /^find (.+?)$/i,
        /^lookup (.+?)$/i,
        /^query (.+?)$/i
      ]
    };
  }
  
  cleanQuery(query) {
    return query
      .toLowerCase()
      .trim()
      .replace(/[?!.,;:]+$/, '')  // Remove trailing punctuation
      .replace(/\s+/g, ' ')        // Normalize whitespace
      .trim();
  }
  
  matchIntent(query) {
    const normalized = this.cleanQuery(query);
    
    // Handle CAN patterns with image synonyms
    if (normalized.match(/^(?:can|could|would|will|please|show|display)/i)) {
      // Check for image/picture/photo requests
      if (normalized.match(/(?:show|display|see|view).*(?:picture|photo|image|pic|portrait|visual)/i)) {
        const patterns = [
          /(?:picture|photo|image|pic|portrait|visual)\s+(?:of|for)\s+(.+?)$/i,
          /(.+?)(?:'s)?\s+(?:picture|photo|image|pic|portrait|visual)$/i,
          /(?:show|display|see|view)\s+(?:me\s+)?(.+?)$/i
        ];
        
        for (const pattern of patterns) {
          const match = normalized.match(pattern);
          if (match && match[1]) {
            return {
              type: 'SHOW_IMAGE',
              entity: match[1].trim(),
              confidence: 0.95,
              original: query
            };
          }
        }
      }
      
      // Tell me about / Learn about patterns
      if (normalized.match(/(?:tell|inform|teach|explain).*about/i)) {
        const match = normalized.match(/about\s+(.+?)$/i);
        return {
          type: 'WHO',
          entity: match ? match[1].trim() : 'unknown',
          confidence: 0.95,
          original: query
        };
      }
      
      if (normalized.match(/(?:learn|know|understand|discover).*about/i)) {
        const match = normalized.match(/about\s+(.+?)$/i);
        return {
          type: 'WHAT',
          entity: match ? match[1].trim() : 'unknown',
          confidence: 0.95,
          original: query
        };
      }
    }
    
    // Check all standard patterns
    for (const [intentType, patterns] of Object.entries(this.intents)) {
      for (const pattern of patterns) {
        const match = normalized.match(pattern);
        if (match) {
          // Clean the entity too
          const entity = match[1] ? match[1].trim().replace(/[?!.,;:]+$/, '') : null;
          return {
            type: intentType,
            entity: entity,
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
