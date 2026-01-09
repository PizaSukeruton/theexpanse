#!/bin/bash

FILE="backend/TSE/LearningDatabase.js"

echo "➡️  PATCH STEP 3: Cleaning debug + fixing pipeline"

# 1) REMOVE all temporary DEBUG createCycle logs
sed -i '' '/DEBUG createCycle/d' "$FILE"

# 2) REMOVE the surrounding separator lines
sed -i '' '/^------------------------------------------------$/d' "$FILE"

# 3) REMOVE any duplicate blank lines created
sed -i '' -e ':a' -e 'N' -e '$!ba' -e 's/\n\n\n/\n\n/g' "$FILE"

# 4) ADD HARD GUARDS at the top of createCycle()
sed -i '' '/async createCycle(acquired) {/a\
        if (!acquired) throw new Error("createCycle: acquired payload missing");\
        if (!acquired.characterId) throw new Error("createCycle: missing characterId");\
        const query = acquired.query || acquired.content;\
        if (!query) throw new Error("createCycle: missing query/content");\
' "$FILE"

echo "✔ PATCH STEP 3 APPLIED"
