# 🚀 DEPLOYMENT GUIDE - Knowledge Retrieval System Fix

## Overview
This guide shows how to deploy the improved knowledge retrieval system that replaces static responses with dynamic semantic search.

**CRITICAL CHANGES:**
1. KnowledgeAcquisitionEngine.js - Complete rewrite with keyword-based semantic search
2. index.js - New endpoints for knowledge state queries
3. No breaking changes - Existing code continues to work

---

## 📋 PRE-DEPLOYMENT CHECKLIST

- [ ] Database has `knowledge_items` table with content
- [ ] Database has `character_knowledge_state` table (ready but empty)
- [ ] Database has `knowledge_review_logs` table (ready but empty)
- [ ] TSE system currently running (test with existing endpoint)
- [ ] PostgreSQL connection working

---

## 🔧 DEPLOYMENT STEPS

### Step 1: Backup Current System

```bash
# Navigate to your backend directory
cd /path/to/expanse-tse/backend

# Backup current knowledge engine
cp knowledge/KnowledgeAcquisitionEngine.js \
   knowledge/KnowledgeAcquisitionEngine.js.backup

# Backup current index
cp TSE/index.js \
   TSE/index.js.backup

echo "✅ Backups created"
```

### Step 2: Deploy New Files

```bash
# Copy improved knowledge engine
cp /home/claude/tse-knowledge-fix/KnowledgeAcquisitionEngine.js \
   backend/knowledge/KnowledgeAcquisitionEngine.js

# Copy enhanced index with new endpoints
cp /home/claude/tse-knowledge-fix/index.js \
   backend/TSE/index.js

echo "✅ New files deployed"
```

### Step 3: Verify File Permissions

```bash
# Ensure files are readable
chmod 644 backend/knowledge/KnowledgeAcquisitionEngine.js
chmod 644 backend/TSE/index.js

echo "✅ Permissions set"
```

### Step 4: Restart Server

```bash
# If using npm run dev
npm run dev

# If using PM2
pm2 restart expanse-api

# If using different process manager, restart accordingly

echo "✅ Server restarted"
```

### Step 5: Verify Deployment

```bash
# Test status endpoint
curl -s http://localhost:3000/api/tse/status | jq

# Should show:
# {
#   "status": "TSE Pipeline operational",
#   "components": {
#     "knowledgeEngine": "KnowledgeResponseEngine ready with semantic search"
#   }
# }
```

---

## 🧪 POST-DEPLOYMENT TESTING

### Test 1: Verify Different Queries Return Different Results

```bash
# Query 1: Tanuki
curl -X POST http://localhost:3000/api/tse/cycle/knowledge \
  -H "Content-Type: application/json" \
  -d '{"characterId":"#700002","query":"What are tanuki?","domain":"mythology"}' \
  | jq -r '.response'

# Save this response
```

```bash
# Query 2: Shapeshifting (should be DIFFERENT)
curl -X POST http://localhost:3000/api/tse/cycle/knowledge \
  -H "Content-Type: application/json" \
  -d '{"characterId":"#700002","query":"shapeshifting creatures","domain":"mythology"}' \
  | jq -r '.response'

# Compare - should NOT be identical to Query 1
```

### Test 2: Check Server Logs

```bash
# Watch server logs for keyword extraction
tail -f /path/to/logs/server.log | grep "Extracted keywords"

# You should see:
# [KnowledgeAcquisitionEngine] Extracted keywords: ["tanuki"]
# [KnowledgeAcquisitionEngine] Extracted keywords: ["shapeshifting", "creatures"]
```

### Test 3: Verify Learning Persistence

```bash
# Run a knowledge cycle
curl -X POST http://localhost:3000/api/tse/cycle/knowledge \
  -H "Content-Type: application/json" \
  -d '{"characterId":"#700002","query":"tanuki folklore"}'

# Check knowledge state (NEW endpoint)
curl -s http://localhost:3000/api/tse/knowledge/state/#700002 | jq
```

Expected response:
```json
{
  "success": true,
  "characterId": "#700002",
  "knowledgeItems": [
    {
      "state_id": "...",
      "knowledge_item_id": "...",
      "retrievability_score": "0.80",
      "review_count": 1,
      "last_reviewed_at": "2025-11-04T...",
      "next_review_at": "2025-11-05T...",
      "title": "...",
      "domain": "mythology"
    }
  ],
  "statistics": {
    "totalItems": 1,
    "averageRetrievability": 0.80,
    "itemsDueForReview": 0,
    "domainBreakdown": {
      "mythology": 1
    }
  }
}
```

### Test 4: Query Available Knowledge Items

```bash
# Search knowledge items by keyword
curl -s "http://localhost:3000/api/tse/knowledge/items?query=tanuki&limit=5" | jq

# Should return knowledge items matching "tanuki"
```

---

## 🔍 TROUBLESHOOTING

### Problem: Still Getting Same Static Response

**Symptoms:**
- All queries return identical "bake-danuki" content
- No keyword extraction in logs

**Solution:**
```bash
# 1. Verify file was actually replaced
ls -la backend/knowledge/KnowledgeAcquisitionEngine.js

# 2. Check if server restarted properly
ps aux | grep node

# 3. Force clear Node cache and restart
rm -rf node_modules/.cache
npm run dev
```

### Problem: "No matches found" in logs

**Symptoms:**
- Logs show: `[KnowledgeAcquisitionEngine] Found 0 potential matches`
- Empty response or fallback used

**Solution:**
```bash
# Verify knowledge_items table has content
psql -U your_user -d your_database -c "SELECT COUNT(*) FROM knowledge_items WHERE is_active = true;"

# Should return > 0

# If empty, you need to populate knowledge_items table first
```

### Problem: TypeError in extractKeywords

**Symptoms:**
- Error: `Cannot read property 'toLowerCase' of undefined`

**Solution:**
```bash
# Check the query is being passed correctly
# Query must be a string, not undefined

# Verify API call includes "query" field:
curl -X POST http://localhost:3000/api/tse/cycle/knowledge \
  -H "Content-Type: application/json" \
  -d '{"characterId":"#700002","query":"test"}' 
  # ^ "query" field is required
```

### Problem: character_knowledge_state table errors

**Symptoms:**
- Database errors when calling ingestNewKnowledge
- "relation does not exist" errors

**Solution:**
```bash
# Verify table exists
psql -U your_user -d your_database -c "\d character_knowledge_state"

# If missing, create from schema:
psql -U your_user -d your_database -f database/schema/character_knowledge_state.sql
```

---

## 📊 VERIFICATION CHECKLIST

After deployment, verify these items:

- [ ] Server starts without errors
- [ ] `/api/tse/status` returns `semantic search` in knowledgeEngine
- [ ] Different queries return different responses
- [ ] Server logs show keyword extraction
- [ ] Knowledge state endpoint returns data after cycles
- [ ] Retrievability scores are stored (0.0 - 1.0)
- [ ] Review counts increment on repeated queries
- [ ] Next review dates are calculated

---

## 🔄 ROLLBACK PROCEDURE

If something goes wrong, rollback to previous version:

```bash
# Restore backup files
cp backend/knowledge/KnowledgeAcquisitionEngine.js.backup \
   backend/knowledge/KnowledgeAcquisitionEngine.js

cp backend/TSE/index.js.backup \
   backend/TSE/index.js

# Restart server
npm run dev
# or
pm2 restart expanse-api

echo "✅ Rolled back to previous version"
```

---

## 📈 MONITORING

### Key Metrics to Watch

1. **Response Time**
   - Target: <1500ms per knowledge cycle
   - Monitor: Server logs for `[KnowledgeResponseEngine] Response generated in XXXms`

2. **Relevance Scores**
   - Target: >60 for relevant results
   - Monitor: Server logs for `relevanceScore` values

3. **Knowledge Items Found**
   - Target: >0 for most queries
   - Monitor: `[KnowledgeAcquisitionEngine] Found N potential matches`

4. **Learning Persistence**
   - Target: 100% of cycles create knowledge_state entries
   - Monitor: Database query count on character_knowledge_state

### Monitoring Queries

```sql
-- Check recent learning activity
SELECT 
    character_id,
    COUNT(*) as items_learned,
    AVG(retrievability_score) as avg_retrievability
FROM character_knowledge_state
WHERE last_reviewed_at > NOW() - INTERVAL '1 day'
GROUP BY character_id;

-- Check review logs
SELECT 
    review_type,
    COUNT(*) as count,
    AVG(performance_score) as avg_performance
FROM knowledge_review_logs
WHERE reviewed_at > NOW() - INTERVAL '1 day'
GROUP BY review_type;
```

---

## 🎯 SUCCESS CRITERIA

✅ **Deployment is successful when:**

1. Different queries return different responses
2. Keyword extraction appears in server logs
3. Relevance scores are calculated and logged
4. Knowledge persists in character_knowledge_state table
5. New endpoints `/knowledge/state/:characterId` and `/knowledge/items` work
6. No Python chunker dependency (removed)
7. All tests in test_knowledge_system.sh pass

---

## 📞 SUPPORT

If issues persist:

1. **Check logs:**
   ```bash
   tail -f /path/to/logs/server.log | grep -E "(Knowledge|TSE-KNOWLEDGE)"
   ```

2. **Verify database:**
   ```sql
   SELECT 
       (SELECT COUNT(*) FROM knowledge_items WHERE is_active = true) as active_items,
       (SELECT COUNT(*) FROM character_knowledge_state) as learned_items,
       (SELECT COUNT(*) FROM knowledge_review_logs) as review_logs;
   ```

3. **Test in isolation:**
   ```javascript
   // In Node.js REPL
   const KnowledgeAcquisitionEngine = require('./backend/knowledge/KnowledgeAcquisitionEngine.js').default;
   const engine = new KnowledgeAcquisitionEngine();
   await engine.initialize();
   const keywords = engine.extractKeywords("What are tanuki?");
   console.log(keywords); // Should output: ['tanuki']
   ```

---

## 📝 NOTES

- **No breaking changes** - Old code continues to work
- **Backward compatible** - Existing TSE cycles unaffected
- **Graceful degradation** - Falls back to broader search if no exact matches
- **Production ready** - No mock data, all real database queries

---

END OF DEPLOYMENT GUIDE
Generated: November 4, 2025
