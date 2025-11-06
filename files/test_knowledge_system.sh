#!/bin/bash
# Test script for improved knowledge retrieval system
# Tests: Keyword extraction, semantic search, learning persistence

echo "======================================================================"
echo "TSE KNOWLEDGE RETRIEVAL - TEST SUITE"
echo "======================================================================"
echo ""

API_BASE="http://localhost:3000/api/tse"
CHARACTER_ID="#700002"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Test 1: Tanuki Knowledge Query${NC}"
echo "Expected: Returns tanuki-specific information"
echo "---"
curl -s -X POST "${API_BASE}/cycle/knowledge" \
  -H "Content-Type: application/json" \
  -d "{
    \"characterId\":\"${CHARACTER_ID}\",
    \"query\":\"What are tanuki?\",
    \"domain\":\"mythology\"
  }" | jq -r '.response' | head -3
echo ""
echo ""

sleep 2

echo -e "${BLUE}🧪 Test 2: Shapeshifting Query (Should be DIFFERENT)${NC}"
echo "Expected: Returns shapeshifting information (NOT tanuki)"
echo "---"
curl -s -X POST "${API_BASE}/cycle/knowledge" \
  -H "Content-Type: application/json" \
  -d "{
    \"characterId\":\"${CHARACTER_ID}\",
    \"query\":\"Tell me about shapeshifting in Japanese folklore\",
    \"domain\":\"mythology\"
  }" | jq -r '.response' | head -3
echo ""
echo ""

sleep 2

echo -e "${BLUE}🧪 Test 3: Mythology Domain Query${NC}"
echo "Expected: Returns general mythology information"
echo "---"
curl -s -X POST "${API_BASE}/cycle/knowledge" \
  -H "Content-Type: application/json" \
  -d "{
    \"characterId\":\"${CHARACTER_ID}\",
    \"query\":\"Japanese mythology creatures\",
    \"domain\":\"mythology\"
  }" | jq -r '.response' | head -3
echo ""
echo ""

sleep 2

echo -e "${BLUE}🧪 Test 4: Learning Profile Analysis${NC}"
echo "Expected: Shows trait-driven learning profile"
echo "---"
curl -s -X GET "${API_BASE}/knowledge/profile/${CHARACTER_ID}" | \
  jq '.profile | {
    learningStyle: .learningStyle,
    knowledgeMotivation: .knowledgeMotivation,
    deliveryPreference: .deliveryPreference,
    emergentPatterns: [.emergentPatterns[].name]
  }'
echo ""
echo ""

echo -e "${GREEN}======================================================================"
echo "RESULTS VERIFICATION"
echo "======================================================================${NC}"
echo ""
echo "✅ Test 1 should mention 'tanuki' or 'bake-danuki'"
echo "✅ Test 2 should mention 'shapeshifting' (NOT just tanuki)"
echo "✅ Test 3 should return mythology-related content"
echo "✅ Test 4 should show emergent patterns like 'curious_cautious'"
echo ""
echo -e "${YELLOW}NOTE: If all tests return the same content, the old system is still active.${NC}"
echo -e "${YELLOW}Deploy the new KnowledgeAcquisitionEngine.js to fix this.${NC}"
echo ""

echo -e "${BLUE}======================================================================"
echo "ADVANCED TESTS (If new system is active)"
echo "======================================================================${NC}"
echo ""

echo -e "${BLUE}🧪 Test 5: Keyword Extraction Test${NC}"
echo "Testing keyword extraction logic..."
echo ""
echo "Query: 'What are Japanese tanuki?'"
echo "Expected Keywords: ['japanese', 'tanuki']"
echo ""
echo "Query: 'Tell me about shapeshifting mythology'"
echo "Expected Keywords: ['shapeshifting', 'mythology']"
echo ""
echo "(Keyword extraction happens server-side, check logs for verification)"
echo ""

echo -e "${BLUE}🧪 Test 6: Relevance Scoring${NC}"
echo "Testing relevance scoring algorithm..."
echo ""
echo "Title match: +30 points"
echo "Content match: +10 points per occurrence (max 40)"
echo "Domain match: +15 points"
echo "Tag match: +20 points"
echo ""
echo "Expected: Items with higher scores appear first"
echo "(Check server logs for 'relevanceScore' values)"
echo ""

echo -e "${GREEN}======================================================================"
echo "TO VERIFY LEARNING PERSISTENCE:"
echo "======================================================================${NC}"
echo ""
echo "1. Run a knowledge cycle"
echo "2. Query the database:"
echo ""
echo "   SELECT character_id, knowledge_item_id, retrievability_score, review_count"
echo "   FROM character_knowledge_state"
echo "   WHERE character_id = '${CHARACTER_ID}';"
echo ""
echo "3. You should see:"
echo "   - Items learned from cycles"
echo "   - Retrievability scores (0.8 - 1.0)"
echo "   - Review counts incrementing"
echo "   - Next review dates scheduled"
echo ""

echo -e "${GREEN}======================================================================"
echo "END OF TEST SUITE"
echo "======================================================================${NC}"
