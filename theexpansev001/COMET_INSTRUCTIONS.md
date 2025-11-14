# Instructions for CoMet - Intent Pattern Testing

## Your Task

Generate **140 test queries** in JSON format to test our intent matcher patterns.

## Patterns to Test (10 types)

1. **CAN** - "Can you...", "Could you...", "Would you...", "Will you...", "Please..."
2. **WHO** - "Who is...", "Who are the...", "Tell me about...", "Identify...", "Show me..."
3. **WHAT** - "What is...", "What are...", "Define...", "Explain..."
4. **WHEN** - "When did...", "When was...", "When will...", "What time..."
5. **WHERE** - "Where is...", "Where are...", "Where did...", "Location of..."
6. **WHY** - "Why did...", "Why is...", "Why does...", "Reason for..."
7. **HOW** - "How does...", "How did...", "How to...", "How is..."
8. **WHICH** - "Which character is...", "Which one...", "Which..."
9. **IS** - "Is X a Y?", "Are X Y?"
10. **SEARCH** - "Search for...", "Find...", "Lookup...", "Query..."

## Coverage Required

**Per pattern: 10 base queries + 4 edge cases = 14 queries × 10 patterns = 140 total**

### Base Queries (10 per pattern)
- Use made-up entities (any words/phrases you want)
- Mix of simple and complex entities
- Vary the trigger words within each pattern

### Edge Cases (4 per pattern)
- UPPERCASE
- lowercase  
- Extra punctuation???
- Multi-word entities (like "the quick brown fox")

## JSON Format
```json
[
  {
    "query": "Your test query here?",
    "expectedPattern": "WHO",
    "expectedEntity": "what should be extracted"
  },
  {
    "query": "Next query here?",
    "expectedPattern": "WHAT",
    "expectedEntity": "expected extraction"
  }
]
```

**Important:**
- `expectedEntity` should be lowercase and trimmed
- Remove trailing punctuation from `expectedEntity`
- Make up ANY entities you want (doesn't need to be real)

## Example Output File

Save your generated queries as: `intent-test-queries.json`

Example:
```json
[
  {
    "query": "Who is the flying spaghetti monster?",
    "expectedPattern": "WHO",
    "expectedEntity": "flying spaghetti monster"
  },
  {
    "query": "WHO IS BATMAN?",
    "expectedPattern": "WHO",
    "expectedEntity": "batman"
  },
  {
    "query": "who is nobody",
    "expectedPattern": "WHO",
    "expectedEntity": "nobody"
  },
  {
    "query": "Tell me about xyzabc???",
    "expectedPattern": "WHO",
    "expectedEntity": "xyzabc"
  }
]
```

## How to Run Tests

Once you create the file:
```bash
cd /Users/pizasukeruton/desktop/theexpanse/theexpansev001
node test-intent-batch.js intent-test-queries.json
```

## What You'll See

**During test:**
```
✅ WHO | "batman" | Who is Batman?
❌ WHAT | Expected WHAT, got WHO | What is who?
✅ WHICH | "fastest" | Which car is fastest?
```

**Summary:**
```
Total Tests: 140
✅ Passed: 135 (96.4%)
❌ Failed: 5 (3.6%)

BY PATTERN TYPE:
✅ WHO: 14/14 passed (100%)
⚠️ WHAT: 13/14 passed (92.9%)
   ❌ "What is who?" - Expected WHAT, got WHO
✅ WHICH: 14/14 passed (100%)
```

---

**Ready for you to generate the 140 queries!**
