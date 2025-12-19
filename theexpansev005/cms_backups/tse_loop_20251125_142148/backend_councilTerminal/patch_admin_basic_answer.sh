FILE="socketHandler.js"
TMP="socketHandler.tmp"

# copy original
cp "$FILE" "$TMP"

awk '
  /=== WHAT USERS WOULD SEE ===/ {
    print "=== BASIC USER ANSWER ===";
    print "";
    print "      const basicIntent = {";
    print "        type: intent.type,";
    print "        entity: intent.entity,";
    print "        entityData: intent.entityData || (intent.godModeSearch?.tier3?.matches?.[0]),";
    print "        realm: intent.realm,";
    print "        original: intent.original";
    print "      };";
    print "";
    print "      const basicUserResult = await cotwQueryEngine.executeQuery(basicIntent, user);";
    print "";
    print "      debugOutput += basicUserResult.message + \"\\n\\n\";";
    print "";
    print "      debugOutput += \"--- EXPANDED MODE ---\\n\";";
    print "      debugOutput += \"[placeholder for expanded mode]\\n\\n\";";
    print "";
    print "      debugOutput += \"--- NLG MODE ---\\n\";";
    print "      debugOutput += \"[placeholder for NLG mode]\\n\\n\";";
    print "";
    print "      debugOutput += \"--- SEMANTIC MODE ---\\n\";";
    print "      debugOutput += \"[placeholder for semantic rewrite]\\n\\n\";";
    print "";
    next
  }
  { print }
' "$TMP" > "$FILE"

rm "$TMP"

echo "Patch applied to $FILE"
