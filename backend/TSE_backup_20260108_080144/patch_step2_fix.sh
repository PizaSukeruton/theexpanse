#!/bin/bash

FILE="backend/TSE/LearningDatabase.js"

# ----------------------------------------
# 1) Remove duplicated debug concept line
# (delete the SECOND occurrence only)
# ----------------------------------------
# Find the first match line number:
FIRST=$(grep -n "\[DEBUG createCycle] concept:" "$FILE" | head -1 | cut -d: -f1)
# Find the second match:
SECOND=$(grep -n "\[DEBUG createCycle] concept:" "$FILE" | sed -n '2p' | cut -d: -f1)

# If second exists, delete it
if [ ! -z "$SECOND" ]; then
  sed -i '' "${SECOND}d" "$FILE"
fi

# ----------------------------------------
# 2) Fix debug label: concept → safeConcept
# ----------------------------------------
sed -i '' 's/\[DEBUG createCycle] concept:/\[DEBUG createCycle] safeConcept:/' "$FILE"

# ----------------------------------------
# 3) Replace final INSERT argument concept → safeConcept
# BSD sed cannot do capture groups → replace exact line fragment
# ----------------------------------------
sed -i '' 's/, concept)/, safeConcept)/' "$FILE"

echo "BSD PATCH STEP 2 APPLIED"
