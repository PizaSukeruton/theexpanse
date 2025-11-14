# Chuckles The Monkey - Quick Reference Card

## Character Basics
- **ID:** #700005
- **Name:** Chuckles The Monkey
- **Type:** B-Roll Chaos
- **Traits:** 30 (Bipolar profile)

## Key Personality Metrics
```
Manic Traits (High):     15 traits (>70)
Regulation (Medium):      3 traits (30-70)
Depressive (Low):        12 traits (<30)
```

## Top 5 Strengths
1. Creativity: 95 - Explosive creative ideas
2. Public Speaking: 95 - Compulsive performer
3. Personal Brand: 95 - Delusionally thinks he's famous
4. Curiosity Drive: 90 - Hyperactive interest
5. Storytelling: 90 - Can't stop talking

## Top 5 Weaknesses
1. Bias Recognition: 10 - Cannot see own delusions
2. Mood Stabilization: 15 - Cannot regulate emotions
3. Self-Regulation: 15 - Minimal impulse control
4. Attachment Security: 15 - Abandoned by TV show
5. Temptation Resistance: 15 - No self-control

## TSE Learning Results
- **Delivery Style:** exploratory_inviting
- **Knowledge Acquired:** 5 Tanuki mythology items
- **Evaluation Score:** 82.0/100
- **Retrievability:** 0.8 (80%)
- **Expertise Scores:** All 80/100

## Database Queries

### Get Chuckles' Traits
```sql
SELECT c.trait_name, cts.percentile_score, c.category
FROM character_trait_scores cts
JOIN characteristics c ON c.hex_color = cts.trait_hex_color
WHERE cts.character_hex_id = '#700005'
ORDER BY cts.percentile_score DESC;
```

### Get Chuckles' Knowledge
```sql
SELECT ki.concept, cks.current_retrievability, cks.current_expertise_score
FROM character_knowledge_state cks
JOIN knowledge_items ki ON ki.knowledge_id = cks.knowledge_id
WHERE cks.character_id = '#700005';
```

### Run Learning Cycle (Node.js)
```javascript
const result = await tseManager.startKnowledgeCycle({
  characterId: '#700005',
  query: 'Your question here',
  domain: 'domain_name'
});
```

## Test Command
```bash
node backend/tests/chuckles-bipolar-test.js
```

## Character Description
"A Rollerskating Chimpanzee who was fired from a Saturday Morning Kid's TV Show but thinks the entire world is still watching Him"

---
**Status:** ✅ Production Ready  
**Last Test:** 2025-11-07 14:06:48 UTC  
**Success Rate:** 100%
