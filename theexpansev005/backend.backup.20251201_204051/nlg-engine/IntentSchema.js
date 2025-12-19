import knowledgeConfig from '../../config/knowledgeConfig.js';

class IntentSchema {
  constructor() {
    this.intents = {
      WHAT: { id: 'WHAT', category: 'entity_description', description: 'What is/are X? Describe entity properties.', entityRequired: true, retrieval_strategy: 'attribute_search', fsrs_weight: 0.8, confidence_threshold: 0.6, example_queries: ['What is Pikachu?', 'What is the Cheese Wars?'], fallback_chain: ['grammar', 'keyword', 'fuzzy'], metadata_fields: ['entity_type', 'category', 'importance'] },
      WHO: { id: 'WHO', category: 'entity_profile', description: 'Who is X? Identity and role information.', entityRequired: true, retrieval_strategy: 'profile_search', fsrs_weight: 0.85, confidence_threshold: 0.65, example_queries: ['Who is Claude?', 'Who created the artifact?'], fallback_chain: ['grammar', 'keyword', 'fuzzy'], metadata_fields: ['character_id', 'role', 'relationships'] },
      WHERE: { id: 'WHERE', category: 'spatial_temporal', description: 'Where is X? Location and context.', entityRequired: true, retrieval_strategy: 'location_search', fsrs_weight: 0.7, confidence_threshold: 0.6, example_queries: ['Where is the Cheese Wars?', 'Where did Piza go?'], fallback_chain: ['keyword', 'fuzzy', 'grammar'], metadata_fields: ['location_id', 'coordinates', 'realm'] },
      WHEN: { id: 'WHEN', category: 'temporal', description: 'When did X happen? Timeline and sequencing.', entityRequired: false, retrieval_strategy: 'timeline_search', fsrs_weight: 0.75, confidence_threshold: 0.65, example_queries: ['When did the Cheese Wars begin?', 'When did Claude meet Piza?'], fallback_chain: ['keyword', 'fuzzy', 'grammar'], metadata_fields: ['timestamp', 'sequence_order', 'narrative_time'] },
      WHY: { id: 'WHY', category: 'causality', description: 'Why did X happen? Causes and consequences.', entityRequired: true, retrieval_strategy: 'causal_search', fsrs_weight: 0.6, confidence_threshold: 0.55, example_queries: ['Why did Piza return?', 'Why is Pikachu Electric-type?'], fallback_chain: ['fuzzy', 'keyword', 'grammar'], metadata_fields: ['cause_id', 'effect_id', 'causality_strength'] },
      HOW: { id: 'HOW', category: 'action_method', description: 'How do/did X do Y? Procedures and methods.', entityRequired: true, retrieval_strategy: 'action_search', fsrs_weight: 0.65, confidence_threshold: 0.6, example_queries: ['How did Claude forge Cheese Fang?', 'How does Pikachu attack?'], fallback_chain: ['keyword', 'fuzzy', 'grammar'], metadata_fields: ['action_id', 'steps', 'prerequisites'] },
      CAUSALITY: { id: 'CAUSALITY', category: 'multi_causal', description: 'Explain the causal chain: A caused B caused C.', entityRequired: true, retrieval_strategy: 'causal_chain_search', fsrs_weight: 0.5, confidence_threshold: 0.5, example_queries: ['What chain of events led to the Cheese Wars?'], fallback_chain: ['fuzzy', 'keyword'], metadata_fields: ['event_chain', 'chain_strength', 'narrative_arc'] },
      ENTITY_DESCRIPTION: { id: 'ENTITY_DESCRIPTION', category: 'entity_description', description: 'Detailed description of X.', entityRequired: true, retrieval_strategy: 'full_segment_search', fsrs_weight: 0.8, confidence_threshold: 0.65, example_queries: ['Tell me about Cheese Fang.'], fallback_chain: ['keyword', 'fuzzy', 'grammar'], metadata_fields: ['description', 'attributes', 'related_entities'] },
      ACTION_METHOD: { id: 'ACTION_METHOD', category: 'procedural', description: 'How to perform action X.', entityRequired: true, retrieval_strategy: 'action_search', fsrs_weight: 0.65, confidence_threshold: 0.6, example_queries: ['How to forge a legendary weapon?'], fallback_chain: ['keyword', 'fuzzy'], metadata_fields: ['steps', 'resources', 'difficulty'] },
      TEMPORAL: { id: 'TEMPORAL', category: 'temporal', description: 'When did/will X happen', entityRequired: false, retrieval_strategy: 'timeline_search', fsrs_weight: 0.75, confidence_threshold: 0.65, example_queries: ['Timeline of events involving Piza.'], fallback_chain: ['keyword', 'fuzzy'], metadata_fields: ['events', 'sequence', 'timeline'] },
      RESOLUTION: { id: 'RESOLUTION', category: 'narrative_resolution', description: 'How was X resolved? Outcome information.', entityRequired: true, retrieval_strategy: 'outcome_search', fsrs_weight: 0.7, confidence_threshold: 0.6, example_queries: ['How did the Cheese Wars end?'], fallback_chain: ['fuzzy', 'keyword'], metadata_fields: ['outcome_type', 'resolution_status', 'consequences'] },
      FOLLOWUP: { id: 'FOLLOWUP', category: 'contextual', description: 'What else? Tell me more. Context-dependent.', entityRequired: false, retrieval_strategy: 'cluster_walk', fsrs_weight: 0.8, confidence_threshold: 0.7, example_queries: ['What else?', 'Tell me more.', 'And then?'], fallback_chain: ['cluster_graph', 'recency'], metadata_fields: ['prior_entity', 'cluster_id', 'recency_score'] },
      CLARIFICATION: { id: 'CLARIFICATION', category: 'meta', description: 'Can you clarify X?', entityRequired: true, retrieval_strategy: 'exact_match', fsrs_weight: 0.9, confidence_threshold: 0.75, example_queries: ['What do you mean by that?', 'Can you rephrase?'], fallback_chain: ['exact', 'keyword'], metadata_fields: ['prior_response', 'ambiguity_markers'] }
    };
    this.adminIntents = { ADDKNOWLEDGE: { category: 'crud_create', tier: 'admin' }, REMOVEKNOWLEDGE: { category: 'crud_delete', tier: 'admin' }, LINKRELATIONSHIP: { category: 'crud_create', tier: 'admin' }, EDITTRAITS: { category: 'crud_update', tier: 'admin' } };
  }
  resolveIntent(query, entity = null, context = {}) {
    const normalized = query.toLowerCase().trim();
    const firstWord = normalized.split(/\s+/)[0];
    const intentMap = { 'what': 'WHAT', 'who': 'WHO', 'where': 'WHERE', 'when': 'WHEN', 'why': 'WHY', 'how': 'HOW' };
    let detectedIntent = intentMap[firstWord] || null;
    if (!detectedIntent && /^(what\s+else|tell\s+me\s+more|and\s+then|what\s+about|more|else)/i.test(normalized)) detectedIntent = 'FOLLOWUP';
    if (!detectedIntent && /^(can\s+you\s+clarify|can\s+you\s+rephrase|what\s+do\s+you\s+mean|clarify)/i.test(normalized)) detectedIntent = 'CLARIFICATION';
    if (detectedIntent === 'WHY' && /chain|sequence|led\s+to|because|caused/i.test(query)) detectedIntent = 'CAUSALITY';
    return { intent: this.intents[detectedIntent] || this.intents.ENTITY_DESCRIPTION, intentType: detectedIntent || 'ENTITY_DESCRIPTION', entity: entity, query: query, confidence: detectedIntent ? 0.9 : 0.5, context: context };
  }
  getIntent(intentId) { return this.intents[intentId] || this.intents.ENTITY_DESCRIPTION; }
  getAllIntents() { return Object.values(this.intents); }
  getRetrievalStrategy(intentId) { const intent = this.getIntent(intentId); return { strategy: intent.retrieval_strategy, fsrs_weight: intent.fsrs_weight, confidence_threshold: intent.confidence_threshold, fallback_chain: intent.fallback_chain }; }
}
export default new IntentSchema();
