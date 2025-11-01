import Fuse from 'fuse.js';
import pool from '../db/pool.js';

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
        /^identify (.+?)$/i,
        /^show me (.+?)$/i
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

    this.knownEntities = [];
    this.synonymMap = new Map();
    this.fuse = null;
    this.initializeFromDatabase();
  }

  async initializeFromDatabase() {
    try {
      // Load all entities from database
      const [characters, concepts, events, narratives] = await Promise.all([
        pool.query('SELECT character_name as name, character_id as id, category, description FROM character_profiles'),
        pool.query('SELECT DISTINCT concept as name, knowledge_id as id, content FROM knowledge_items WHERE concept IS NOT NULL'),
        pool.query('SELECT DISTINCT event_type as name, event_id as id, notes FROM multiverse_events LIMIT 100'),
        pool.query('SELECT title as name, segment_id as id, keywords FROM narrative_segments WHERE title IS NOT NULL LIMIT 100')
      ]);

      this.knownEntities = [
        ...characters.rows.map(r => ({ ...r, entityType: 'character' })),
        ...concepts.rows.map(r => ({ ...r, entityType: 'knowledge' })),
        ...events.rows.map(r => ({ ...r, entityType: 'event' })),
        ...narratives.rows.map(r => ({ ...r, entityType: 'narrative' }))
      ];

      // Build synonym map from character descriptions and keywords
      for (const entity of this.knownEntities) {
        const name = entity.name.toLowerCase();
        if (!this.synonymMap.has(name)) {
          this.synonymMap.set(name, new Set());
        }
        
        // Extract potential synonyms from descriptions and keywords
        if (entity.description) {
          const words = entity.description.toLowerCase().split(/\s+/).slice(0, 10);
          words.forEach(word => {
            if (word.length > 3) this.synonymMap.get(name).add(word);
          });
        }
        
        if (entity.keywords) {
          const keywords = entity.keywords.toLowerCase().split(/[,\s]+/);
          keywords.forEach(kw => this.synonymMap.get(name).add(kw));
        }
      }

      // Initialize Fuse for fuzzy searching
      this.fuse = new Fuse(this.knownEntities, {
        keys: ['name', 'description', 'keywords'],
        threshold: 0.4,
        includeScore: true,
        minMatchCharLength: 2
      });

      console.log(`✅ Intent matcher initialized with ${this.knownEntities.length} entities from database`);
    } catch (error) {
      console.error('Failed to initialize from database:', error);
      this.fuse = new Fuse([], { keys: ['name'] });
    }
  }
  
  cleanQuery(query) {
    return query
      .toLowerCase()
      .trim()
      .replace(/[?!.,;:]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  findSynonymMatch(entity) {
    const lower = entity.toLowerCase();
    for (const [canonical, synonyms] of this.synonymMap.entries()) {
      if (canonical === lower || synonyms.has(lower)) {
        return canonical;
      }
    }
    return entity;
  }

  calculateConfidence(matchType, fuzzyScore = null) {
    if (matchType === 'exact') return 1.0;
    if (matchType === 'pattern') return 0.95;
    if (matchType === 'synonym') return 0.9;
    if (matchType === 'fuzzy' && fuzzyScore !== null) {
      return Math.max(0.5, Math.min(0.85, 1 - fuzzyScore));
    }
    if (matchType === 'fallback') return 0.7;
    return 0.5;
  }

  async findFuzzyMatch(entity) {
    if (!this.fuse || !entity) return null;
    
    const results = this.fuse.search(entity);
    if (results.length > 0 && results[0].score < 0.4) {
      return {
        match: results[0].item,
        score: results[0].score,
        suggestions: results.slice(0, 3).map(r => r.item.name)
      };
    }
    return null;
  }

  async matchIntent(query, context = null) {
    const normalized = this.cleanQuery(query);
    
    // Handle context-aware pronouns
    if (context && context.lastEntity) {
      const pronounPatterns = /^(who|what|where|when|why|how) (?:is|was|are|were)? (?:he|she|it|they|that|this)$/i;
      if (pronounPatterns.test(normalized)) {
        const intentWord = normalized.match(/^(who|what|where|when|why|how)/i)[1].toUpperCase();
        return {
          type: intentWord,
          entity: context.lastEntity,
          confidence: 0.85,
          original: query,
          contextUsed: true
        };
      }
    }
    
    // Handle image patterns
    if (normalized.match(/(?:show|display|see|view).*(?:picture|photo|image|pic|portrait|visual)/i)) {
      const patterns = [
        /(?:picture|photo|image|pic|portrait|visual)\s+(?:of|for)\s+(.+?)$/i,
        /(.+?)(?:'s)?\s+(?:picture|photo|image|pic|portrait|visual)$/i,
        /(?:show|display|see|view)\s+(?:me\s+)?(.+?)$/i
      ];
      
      for (const pattern of patterns) {
        const match = normalized.match(pattern);
        if (match && match[1]) {
          const entity = match[1].trim();
          const expandedEntity = this.findSynonymMatch(entity);
          const fuzzyMatch = await this.findFuzzyMatch(entity);
          
          return {
            type: 'SHOW_IMAGE',
            entity: fuzzyMatch ? fuzzyMatch.match.name : expandedEntity,
            confidence: fuzzyMatch ? this.calculateConfidence('fuzzy', fuzzyMatch.score) : 0.9,
            original: query,
            suggestions: fuzzyMatch ? fuzzyMatch.suggestions : null
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
          if (entity) {
            const expandedEntity = this.findSynonymMatch(entity);
            const fuzzyMatch = await this.findFuzzyMatch(entity);
            
            return {
              type: intentType,
              entity: fuzzyMatch ? fuzzyMatch.match.name : expandedEntity,
              confidence: fuzzyMatch ? this.calculateConfidence('fuzzy', fuzzyMatch.score) : 0.95,
              original: query,
              suggestions: fuzzyMatch ? fuzzyMatch.suggestions : null
            };
          }
        }
      }
    }
    
    // Fallback with fuzzy search
    const fuzzyMatch = await this.findFuzzyMatch(normalized);
    if (fuzzyMatch) {
      return {
        type: 'SEARCH',
        entity: fuzzyMatch.match.name,
        confidence: this.calculateConfidence('fuzzy', fuzzyMatch.score),
        original: query,
        suggestions: fuzzyMatch.suggestions
      };
    }
    
    return {
      type: 'SEARCH',
      entity: normalized,
      confidence: 0.7,
      original: query
    };
  }
}

export default new CotwIntentMatcher();
