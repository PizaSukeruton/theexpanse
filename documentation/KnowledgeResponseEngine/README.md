# Knowledge Response Engine

## Overview
The Knowledge Response Engine is the core system that delivers personalized, trait-driven learning experiences to characters. It combines cognitive psychology, spaced repetition algorithms, and personality modeling to create realistic learning behaviors.

## System Components

### 1. [Cognitive Load Management](./CognitiveLoad/COGNITIVE_LOAD_PARAMETERS.md)
Controls working memory capacity based on character traits, simulating human cognitive limitations.

**Key Features:**
- 7-chunk base working memory (Miller's Law)
- Dynamic capacity adjustment based on intelligence/anxiety
- 30-second temporal decay
- Overload detection and management

### 2. [FSRS Algorithm](./FSRS/)
Free Spaced Repetition Scheduler for optimal review timing and memory retention.

**Key Features:**
- Industry-standard memory scheduling
- Trait-modified learning curves (optional)
- Stability and difficulty tracking
- Exponential interval growth

### 3. [Trait Aggregation System](./TraitAggregation/)
Maps 270 individual traits to 24 higher-level psychological dimensions.

**Key Features:**
- Weighted influence matrix
- Emergent pattern detection
- Personality-driven response styles
- Real-time trait scoring

## Architecture
```
Query Input
    ↓
Character Traits (270) → Trait Aggregation → 24 Dimensions
    ↓
Cognitive Load Check → Working Memory Capacity
    ↓
Knowledge Retrieval → PostgreSQL Search
    ↓
FSRS Scheduling → Review Timing
    ↓
Personalized Response → Trait-Driven Delivery Style
```

## File Location
`/backend/TSE/helpers/KnowledgeResponseEngine.js`

## Related Systems
- [Belt Progression](../BeltProgression/) - Tracks mastery over time
- Character Engine - Loads trait data
- Knowledge Acquisition Engine - Retrieves relevant knowledge

---

**Last Updated:** November 5, 2025
