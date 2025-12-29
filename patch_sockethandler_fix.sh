#!/bin/bash

FILE="backend/councilTerminal/socketHandler.js"

START=468
END=473

TMP="$(mktemp)"

sed "${START},${END}d" "$FILE" > "$TMP"

(
  sed -n "1,$((START-1))p" "$TMP"

  cat << 'BLOCK'
      debugOutput += `\n\n${'='.repeat(60)}\n`;
      debugOutput += '\n=== BASIC USER ANSWER ===\n\n';

      const userLikeIntent = {
        type: intent.type,
        entity: intent.entity,
        entityData: intent.entityData || (intent.godModeSearch?.tier3?.matches?.[0]),
        realm: intent.realm,
        original: intent.original
      };

      const userBasicResult = await cotwQueryEngine.executeQuery(userLikeIntent, user);

      debugOutput += userBasicResult.message + "\n";

      return { output: debugOutput };
BLOCK

  sed -n "$((START))"',$p' "$TMP"
) > "$FILE"

rm "$TMP"

echo "Patch applied to $FILE"
