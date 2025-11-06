# 🔄 KNOWLEDGE RETRIEVAL FLOW DIAGRAM

## NEW SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    API REQUEST                                   │
│   POST /api/tse/cycle/knowledge                                 │
│   { characterId, query, domain }                                │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              TSELoopManager.startKnowledgeCycle()               │
│   Creates cycle (#8XXXXX), records teacher decision             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│         KnowledgeResponseEngine.generateKnowledgeResponse()     │
│   Loads 270 traits, analyzes personality                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│    KnowledgeAcquisitionEngine.retrieveRelevantKnowledge()      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. EXTRACT KEYWORDS (Pure JavaScript)                    │  │
│  │    Input:  "What are Japanese tanuki?"                   │  │
│  │    Output: ["japanese", "tanuki"]                        │  │
│  │    Filter: Remove stop words (a, the, are, what)        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                     │                                            │
│                     ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 2. SEMANTIC SEARCH (PostgreSQL)                          │  │
│  │    SELECT * FROM knowledge_items                         │  │
│  │    WHERE                                                 │  │
│  │      title ILIKE '%japanese%' OR                         │  │
│  │      title ILIKE '%tanuki%' OR                           │  │
│  │      content ILIKE '%japanese%' OR                       │  │
│  │      content ILIKE '%tanuki%'                            │  │
│  │    LIMIT 20                                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                     │                                            │
│                     ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 3. CALCULATE RELEVANCE SCORES                            │  │
│  │    For each item:                                        │  │
│  │      - Title match:    +30 points                        │  │
│  │      - Content match:  +10 points (max 40)              │  │
│  │      - Domain match:   +15 points                        │  │
│  │      - Tag match:      +20 points                        │  │
│  │                                                          │  │
│  │    Example Results:                                      │  │
│  │      Item A: "Tanuki Folklore" → Score: 85              │  │
│  │      Item B: "Japanese Mythology" → Score: 60           │  │
│  │      Item C: "Asian Creatures" → Score: 35              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                     │                                            │
│                     ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 4. SORT & FILTER                                         │  │
│  │    - Sort by relevance (highest first)                   │  │
│  │    - Filter: Keep items with score ≥ 20                 │  │
│  │    - Return top N results (limit: 5)                     │  │
│  │                                                          │  │
│  │    Returns: [Item A (85), Item B (60), Item C (35)]     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│         KnowledgeResponseEngine.shapeKnowledgeDelivery()        │
│   Formats content based on:                                     │
│   - Learning profile (curious_cautious)                         │
│   - Delivery style (exploratory_inviting)                       │
│   - Cognitive load (current: 4/12)                              │
│                                                                  │
│   Output: "Consider exploring: Tanuki are shapeshifting..."    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│    KnowledgeAcquisitionEngine.ingestNewKnowledge() [NEW!]      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. CHECK EXISTING KNOWLEDGE                              │  │
│  │    SELECT * FROM character_knowledge_state               │  │
│  │    WHERE character_id = '#700002'                        │  │
│  │      AND knowledge_item_id = 'item_123'                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                     │                                            │
│           ┌─────────┴─────────┐                                 │
│           │                   │                                 │
│      EXISTS                NEW                                  │
│           │                   │                                 │
│           ▼                   ▼                                 │
│  ┌──────────────┐    ┌──────────────┐                          │
│  │   UPDATE     │    │    INSERT    │                          │
│  │              │    │              │                          │
│  │ retrievability│    │ Initial:     │                          │
│  │   += 0.1     │    │   score: 0.8 │                          │
│  │ review_count │    │   count: 1   │                          │
│  │   += 1       │    │              │                          │
│  └──────────────┘    └──────────────┘                          │
│           │                   │                                 │
│           └─────────┬─────────┘                                 │
│                     │                                            │
│                     ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 2. SCHEDULE NEXT REVIEW (Spaced Repetition)             │  │
│  │    next_review_at = NOW() + (2^review_count) days       │  │
│  │                                                          │  │
│  │    Review 1: +1 day                                      │  │
│  │    Review 2: +2 days                                     │  │
│  │    Review 3: +4 days                                     │  │
│  │    Review 4: +8 days                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                     │                                            │
│                     ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 3. LOG LEARNING EVENT                                    │  │
│  │    INSERT INTO knowledge_review_logs (                   │  │
│  │      character_id,                                       │  │
│  │      knowledge_item_id,                                  │  │
│  │      review_type = 'acquisition',                        │  │
│  │      performance_score = 0.8                             │  │
│  │    )                                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  EVALUATION COMPONENT                            │
│   Scores: appropriateness, traitAlignment, cognitiveLoad        │
│   Overall Score: 85/100                                         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              UPDATE TSE CYCLE (Complete)                         │
│   Status: completed                                             │
│   Performance: { score: 85, traits: [...] }                    │
│   Learning Outcomes: { deliveryStyle, patterns }               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API RESPONSE                                   │
│   {                                                             │
│     success: true,                                              │
│     cycleId: "#8003E9",                                         │
│     response: "Consider exploring: Tanuki...",                  │
│     deliveryStyle: "exploratory_inviting",                      │
│     score: 85                                                   │
│   }                                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## COMPARISON: BEFORE vs AFTER

### OLD SYSTEM (Broken)
```
Query: "What are tanuki?"
    ↓
[No keyword extraction]
    ↓
[Always returns first DB entry]
    ↓
Response: "bake-danuki..."
```

### NEW SYSTEM (Fixed)
```
Query: "What are tanuki?"
    ↓
Keywords: ["tanuki"]
    ↓
Search 20 items → Score all → Filter & sort
    ↓
Top 5 relevant items (scores: 85, 75, 65, 60, 55)
    ↓
Format based on personality traits
    ↓
Response: "Consider exploring: Tanuki are shapeshifting creatures..."
    ↓
Store in character_knowledge_state (retrievability: 0.8)
```

---

## DATA FLOW EXAMPLE

### Query: "Japanese shapeshifting creatures"

**Step 1: Keyword Extraction**
```
Input:    "Japanese shapeshifting creatures"
Filtered: ["japanese", "shapeshifting", "creatures"]
          (removed: "the", "are", "what", "in")
```

**Step 2: Database Search**
```sql
Found 12 items containing keywords:
  - "Tanuki Folklore" (has: japanese, creatures)
  - "Kitsune Legends" (has: japanese, shapeshifting)
  - "Yokai Overview" (has: japanese, creatures)
  - "Shapeshifting Mythology" (has: shapeshifting)
  - [8 more items...]
```

**Step 3: Relevance Scoring**
```
"Tanuki Folklore"
  - Title: "Tanuki" not in keywords → 0
  - Content: "japanese" appears 3x → 30
  - Content: "creatures" appears 2x → 20
  - Domain: "mythology" not in keywords → 0
  - Tags: ["japanese", "folklore"] → 20
  → Total Score: 70

"Kitsune Legends"  
  - Title: "Kitsune" not in keywords → 0
  - Content: "japanese" appears 5x → 40 (max)
  - Content: "shapeshifting" appears 4x → 40 (max)
  - Domain: "mythology" → 0
  - Tags: ["japanese", "shapeshifting"] → 20
  → Total Score: 100

"Shapeshifting Mythology"
  - Title: "Shapeshifting" in keywords → 30
  - Content: "shapeshifting" appears 8x → 40 (max)
  - Domain: "mythology" → 0
  - Tags: ["shapeshifting", "folklore"] → 20
  → Total Score: 90
```

**Step 4: Sorted Results**
```
1. "Kitsune Legends" (100)
2. "Shapeshifting Mythology" (90)
3. "Tanuki Folklore" (70)
4. [Other items with scores 65, 55, 45...]
```

**Step 5: Top 5 Returned**
```javascript
[
  { title: "Kitsune Legends", score: 100, ... },
  { title: "Shapeshifting Mythology", score: 90, ... },
  { title: "Tanuki Folklore", score: 70, ... },
  { title: "Yokai Taxonomy", score: 65, ... },
  { title: "Japanese Folklore", score: 55, ... }
]
```

**Step 6: Formatted Response**
```
Based on character traits (curious_cautious → exploratory_inviting):

"Consider exploring: Kitsune are fox spirits in Japanese folklore 
known for their shapeshifting abilities. Like tanuki, they can 
transform into human form, but kitsune are typically more cunning 
and possess magical powers. The mythology around shapeshifting 
creatures in Japan reflects deep cultural beliefs about the 
boundary between human and animal worlds..."
```

**Step 7: Persistence**
```sql
INSERT INTO character_knowledge_state (
  character_id,
  knowledge_item_id,
  retrievability_score,
  review_count,
  next_review_at
) VALUES (
  '#700002',
  'ki_kitsune_001',
  0.8,
  1,
  NOW() + INTERVAL '1 day'
);

INSERT INTO knowledge_review_logs (
  character_id,
  knowledge_item_id,
  review_type,
  performance_score
) VALUES (
  '#700002',
  'ki_kitsune_001',
  'acquisition',
  0.8
);
```

---

## KEY DIFFERENCES FROM OLD SYSTEM

| Feature | Old System | New System |
|---------|-----------|------------|
| **Keyword Extraction** | ❌ None | ✅ 82 stop words |
| **Search Method** | ❌ First entry | ✅ ILIKE multiple fields |
| **Relevance Scoring** | ❌ None | ✅ 0-100 algorithm |
| **Result Variety** | ❌ Always same | ✅ Query-dependent |
| **Learning Storage** | ❌ None | ✅ character_knowledge_state |
| **Review Schedule** | ❌ None | ✅ Spaced repetition |
| **Logging** | ❌ None | ✅ knowledge_review_logs |
| **Python Dependency** | ⚠️  ChunkerBridge | ✅ Pure JavaScript |

---

END OF FLOW DIAGRAM
