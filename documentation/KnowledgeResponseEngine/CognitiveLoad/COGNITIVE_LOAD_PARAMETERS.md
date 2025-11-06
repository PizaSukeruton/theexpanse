# Cognitive Load Management Parameters

## Overview
These parameters control how characters manage information processing, simulating human working memory limitations based on cognitive psychology research.

## Scientific Foundation

### George Miller (1956) - "The Magical Number Seven, Plus or Minus Two"
The foundational research showing humans can hold approximately 7 chunks of information in working memory simultaneously.

**Citation:** Miller, G. A. (1956). The magical number seven, plus or minus two: Some limits on our capacity for processing information. Psychological Review, 63(2), 81-97.

### Baddeley & Hitch (1974) - Working Memory Model
Expanded understanding of working memory as a limited-capacity system for temporary storage and manipulation of information.

**Citation:** Baddeley, A. D., & Hitch, G. (1974). Working memory. Psychology of Learning and Motivation, 8, 47-89.

### Sweller (1988) - Cognitive Load Theory
Framework for understanding how instructional design affects learning based on working memory limitations.

**Citation:** Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. Cognitive Science, 12(2), 257-285.

---

## Parameter Definitions

### baseWorkingMemoryCapacity: 7
**Value:** 7 chunks  
**Origin:** Miller's classic finding  
**Real-world example:** Phone numbers (7 digits)  
**System behavior:** Default number of knowledge items a character can process simultaneously

### minWorkingMemoryCapacity: 3
**Value:** 3 chunks  
**Origin:** Modern research on stressed/fatigued cognition  
**Real-world example:** Capacity under high anxiety or sleep deprivation  
**System behavior:** Minimum capacity floor when character traits reduce working memory

### maxWorkingMemoryCapacity: 12
**Value:** 12 chunks  
**Origin:** Studies of experts and trained individuals  
**Real-world example:** Chess masters holding ~12 board positions  
**System behavior:** Maximum capacity ceiling for high-intelligence characters

### cognitiveTraitCapacityBonus: 3
**Value:** +3 chunks  
**Design rationale:** ~40% increase for high cognitive traits (7 → 10)  
**Real-world analog:** Intelligence/training effects on working memory  
**System behavior:** Added to base capacity when cognitive traits are high

**Formula:**
```javascript
if (character.cognitive.intelligence > 70) {
    capacity = baseCapacity + cognitiveTraitCapacityBonus
    // 7 + 3 = 10 chunks
}
```

### neuroticismCapacityPenalty: 2
**Value:** -2 chunks  
**Design rationale:** ~30% reduction for high anxiety (7 → 5)  
**Real-world analog:** Anxiety "stealing" working memory resources  
**Research basis:** Worry occupies working memory slots

**Formula:**
```javascript
if (character.emotional.anxiety > 70) {
    capacity = baseCapacity - neuroticismCapacityPenalty
    // 7 - 2 = 5 chunks
}
```

### temporalDecayIntervalMs: 30000
**Value:** 30,000 milliseconds (30 seconds)  
**Origin:** Classic short-term memory duration without rehearsal  
**Real-world example:** Remembering a phone number temporarily  
**System behavior:** Knowledge chunks expire after 30 seconds if not reinforced

**Research note:** Peterson & Peterson (1959) demonstrated rapid forgetting after 18-30 seconds without rehearsal.

### overloadThresholdFactor: 0.9
**Value:** 90% of capacity  
**Design rationale:** Warning level before complete saturation  
**Real-world analog:** RAM/CPU usage warning thresholds  
**System behavior:** Triggers cognitive overload warnings at 6.3/7 chunks

**Example:**
```javascript
capacity = 7
overloadThreshold = 7 * 0.9 = 6.3 chunks
// System warns at 6 active chunks
```

### persistentOverloadThreshold: 0.85
**Value:** 85% of capacity sustained  
**Design rationale:** Chronic stress detection threshold  
**Real-world analog:** Burnout indicators in workplace psychology  
**System behavior:** Sustained load at 85%+ triggers learning impairment

### persistentLoadImpact: 2
**Value:** -2 chunks  
**Design rationale:** Mental exhaustion reduces effective capacity  
**Real-world analog:** Cognitive fatigue from sustained high load  
**System behavior:** Persistent overload reduces capacity by 2 chunks

**Formula:**
```javascript
if (sustainedLoad > persistentOverloadThreshold) {
    effectiveCapacity = baseCapacity - persistentLoadImpact
    // 7 - 2 = 5 chunks (exhaustion state)
}
```

---

## Integration with Character Traits

### High-Intelligence Character Example
**Traits:**
- Intelligence: 85
- Memory: 80
- Focus: 75

**Resulting Capacity:**
```
Base: 7 chunks
+ Cognitive bonus: +3 chunks
= 10 chunks working memory
```

**Behavior:** Can process more knowledge items simultaneously, better learning retention.

### High-Anxiety Character Example
**Traits:**
- Anxiety: 80
- Emotional Stability: 30
- Confidence: 40

**Resulting Capacity:**
```
Base: 7 chunks
- Anxiety penalty: -2 chunks
= 5 chunks working memory
```

**Behavior:** Reduced capacity, needs simpler explanations, more prone to overload.

### Balanced Character Example
**Traits:**
- Intelligence: 60
- Anxiety: 50
- Memory: 65

**Resulting Capacity:**
```
Base: 7 chunks
(No bonuses or penalties applied)
= 7 chunks working memory
```

**Behavior:** Standard learning capacity, typical cognitive processing.

---

## Temporal Decay Mechanism

### How It Works
Every 30 seconds, the system checks active knowledge chunks:
```javascript
const now = Date.now();
for (const chunk of activeChunks) {
    const age = now - chunk.timestamp;
    if (age > 30000) {
        // Chunk has decayed, remove from working memory
        removeChunk(chunk);
    }
}
```

### Real-World Analog
Like rehearsing a phone number - if you don't repeat it, you forget it within ~30 seconds.

### Character Impact
- High-memory characters may have slower decay (future enhancement)
- Anxious characters may have faster decay (future enhancement)

---

## Overload Detection

### Warning Level (90%)
**When triggered:**
```javascript
if (activeChunks.length >= capacity * 0.9) {
    triggerWarning();
}
```

**System response:**
- Logs cognitive load warning
- May simplify next knowledge delivery
- Prevents adding more complex information

### Persistent Overload (85% sustained)
**When triggered:**
```javascript
if (avgLoadOver5Cycles >= 0.85) {
    applyPersistentLoadPenalty();
}
```

**System response:**
- Reduces effective capacity by 2 chunks
- Forces simpler information delivery
- Requires "rest" (lower load cycles) to recover

---

## Configuration File Location
`/config/knowledgeConfig.js`

**Section:**
```javascript
cognitiveLoad: {
    baseWorkingMemoryCapacity: 7,
    minWorkingMemoryCapacity: 3,
    maxWorkingMemoryCapacity: 12,
    cognitiveTraitCapacityBonus: 3,
    neuroticismCapacityPenalty: 2,
    temporalDecayIntervalMs: 30000,
    overloadThresholdFactor: 0.9,
    persistentOverloadThreshold: 0.85,
    persistentLoadImpact: 2
}
```

---

## Related Documentation
- [FSRS Algorithm](/documentation/FSRS/FSRS_ALGORITHM.md)
- [Trait Aggregation System](/documentation/KnowledgeResponseEngine/TRAIT_AGGREGATION.md)
- [Belt Progression System](/documentation/BeltProgression/ADVANCEMENT_CRITERIA.md)

---

## References

Miller, G. A. (1956). The magical number seven, plus or minus two: Some limits on our capacity for processing information. *Psychological Review, 63*(2), 81-97.

Baddeley, A. D., & Hitch, G. (1974). Working memory. *Psychology of Learning and Motivation, 8*, 47-89.

Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science, 12*(2), 257-285.

Peterson, L. R., & Peterson, M. J. (1959). Short-term retention of individual verbal items. *Journal of Experimental Psychology, 58*(3), 193-198.

---

**Document Version:** 1.0  
**Last Updated:** November 4, 2025  
**Author:** The Expanse Development Team
