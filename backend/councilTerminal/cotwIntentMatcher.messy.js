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
      .replace(/[?!.,;:]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  matchIntent(query) {
    const normalized = this.cleanQuery(query);

    if (normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i)) {
      const match = normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i);
      if (match) {
        return {
          type: "SHOW_IMAGE",
          entity: match[1],
          confidence: 0.95,
          original: query
        };
      }
    }
    if (normalized.match(/^[a-z]+$/i) && normalized.length > 2) {
      return {
        type: "SEARCH",
        entity: normalized,
        confidence: 0.8,
        original: query
      };
    }
    
    if (normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i)) {
      const match = normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i);
      if (match) {
        return {
          type: "SHOW_IMAGE",
          entity: match[1],
          confidence: 0.95,
          original: query
        };
      }
    }
    if (normalized.match(/^(?:show|display|view|see)\s+([^\s]+)$/i)) {
      const match = normalized.match(/^(?:show|display|view|see)\s+([^\s]+)$/i);
      if (match) {
        return {
          type: "SHOW_IMAGE",
          entity: match[1],
          confidence: 0.95,
          original: query
        };
      }
    }
    
    if (normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i)) {
      const match = normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i);
      if (match) {
        return {
          type: "SHOW_IMAGE",
          entity: match[1],
          confidence: 0.95,
          original: query
        };
      }
    }
    if (normalized.match(/^([^\s]+)\s+(?:pic|img|photo|image|picture)$/i)) {
      const match = normalized.match(/^([^\s]+)\s+(?:pic|img|photo|image|picture)$/i);
      if (match) {
        return {
          type: "SHOW_IMAGE",
          entity: match[1],
          confidence: 0.95,
          original: query
        };
      }
    }
    
    // Direct image request patterns (without "can you")
    if (normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i)) {
      const match = normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i);
      if (match) {
        return {
          type: "SHOW_IMAGE",
          entity: match[1],
          confidence: 0.95,
          original: query
        };
      }
    }
    if (normalized.match(/(?:display|show|see|view)\s+(?:me\s+)?(?:a\s+)?(?:picture|photo|image|pic|portrait|visual)\s+(?:of\s+)?(.+?)$/i)) {
      const match = normalized.match(/(?:display|show|see|view)\s+(?:me\s+)?(?:a\s+)?(?:picture|photo|image|pic|portrait|visual)\s+(?:of\s+)?(.+?)$/i);
      if (match) {
        return {
          type: 'SHOW_IMAGE',
          entity: match[1].trim(),
          confidence: 0.95,
          original: query
        };
      }
    }
    
    // Pattern: "[name] picture/photo/image"
    if (normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i)) {
      const match = normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i);
      if (match) {
        return {
          type: "SHOW_IMAGE",
          entity: match[1],
          confidence: 0.95,
          original: query
        };
      }
    }
    if (normalized.match(/^(.+?)\s+(?:picture|photo|image|pic|portrait|visual)$/i)) {
      const match = normalized.match(/^(.+?)\s+(?:picture|photo|image|pic|portrait|visual)$/i);
      if (match) {
        return {
          type: 'SHOW_IMAGE',
          entity: match[1].trim(),
          confidence: 0.95,
          original: query
        };
      }
    }
    
    // Handle CAN patterns
    if (normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i)) {
      const match = normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i);
      if (match) {
        return {
          type: "SHOW_IMAGE",
          entity: match[1],
          confidence: 0.95,
          original: query
        };
      }
    }
    if (normalized.match(/^(?:can|could|would|will|please)/i)) {
      // "can I see [name] image"
    if (normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i)) {
      const match = normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i);
      if (match) {
        return {
          type: "SHOW_IMAGE",
          entity: match[1],
          confidence: 0.95,
          original: query
        };
      }
    }
      if (normalized.match(/(?:see|view|look at)\s+(.+?)\s+(?:picture|photo|image|pic|portrait|visual)/i)) {
        const match = normalized.match(/(?:see|view|look at)\s+(.+?)\s+(?:picture|photo|image|pic|portrait|visual)/i);
        if (match) {
          return {
            type: 'SHOW_IMAGE',
            entity: match[1].trim(),
            confidence: 0.95,
            original: query
          };
        }
      }
      
      // "can you show/display..."
    if (normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i)) {
      const match = normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i);
      if (match) {
        return {
          type: "SHOW_IMAGE",
          entity: match[1],
          confidence: 0.95,
          original: query
        };
      }
    }
      if (normalized.match(/show.*(?:picture|photo|image|pic|portrait|visual)/i)) {
        const patterns = [
          /(?:picture|photo|image|pic|portrait|visual)\s+(?:of|for)\s+(.+?)$/i,
          /(.+?)(?:'s)?\s+(?:picture|photo|image|pic|portrait|visual)$/i,
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
      
      // "tell me about" pattern
    if (normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i)) {
      const match = normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i);
      if (match) {
        return {
          type: "SHOW_IMAGE",
          entity: match[1],
          confidence: 0.95,
          original: query
        };
      }
    }
      if (normalized.match(/(?:tell|inform|teach|explain).*about/i)) {
        const match = normalized.match(/about\s+(.+?)$/i);
        return {
          type: 'WHO',
          entity: match ? match[1].trim() : 'unknown',
          confidence: 0.95,
          original: query
        };
      }
      
      // "learn about" pattern - should be WHAT not error
    if (normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i)) {
      const match = normalized.match(/^(?:pic|img|photo|image|picture)\s+([^\s]+)$/i);
      if (match) {
        return {
          type: "SHOW_IMAGE",
          entity: match[1],
          confidence: 0.95,
          original: query
        };
      }
    }
      if (normalized.match(/(?:learn|know|understand|discover).*about/i)) {
        const match = normalized.match(/about\s+(.+?)$/i);
        if (match) {
          // Check if it's likely a character or a concept
          const entity = match[1].trim();
          // If it contains "wars", "battle", "conflict" etc, likely a narrative/concept
          if (entity.match(/war|battle|conflict|crisis|saga|story/i)) {
            return {
              type: 'SEARCH',
              entity: entity,
              confidence: 0.9,
              original: query
            };
          }
          return {
            type: 'WHAT',
            entity: entity,
            confidence: 0.95,
            original: query
          };
        }
      }
    }
    
    // Check all standard patterns
    for (const [intentType, patterns] of Object.entries(this.intents)) {
      for (const pattern of patterns) {
        const match = normalized.match(pattern);
        if (match) {
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
    
    // Fallback to SEARCH
    return {
      type: 'SEARCH',
      entity: normalized,
      confidence: 0.7,
      original: query
    };
  }
}

export default new CotwIntentMatcher();
