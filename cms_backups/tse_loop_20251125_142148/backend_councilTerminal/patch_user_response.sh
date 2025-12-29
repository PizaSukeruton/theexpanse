#!/bin/bash

# Backup the current file
cp socketHandler.js socketHandler.js.backup.$(date +%s)

# Use sed to update the specific TODO section for user display
sed -i '' '469,479c\
      debugOutput += `\\n\\n${"=".repeat(60)}\\n`;\
      debugOutput += "\\n=== WHAT USERS WOULD SEE ===\\n\\n";\
      \
      // Generate the actual user response\
      const bestMatch = intent.godModeSearch.tier1?.matches[0] || \
                       intent.godModeSearch.tier2?.matches[0] || \
                       intent.godModeSearch.tier3?.matches[0];\
      \
      if (bestMatch) {\
        const userIntent = {\
          type: intent.type,\
          entity: bestMatch.entity_name,\
          entityData: bestMatch,\
          realm: intent.realm,\
          original: intent.original\
        };\
        \
        try {\
          const userResult = await cotwQueryEngine.executeQuery(userIntent, user);\
          if (userResult.success) {\
            debugOutput += "--- USER MODE ---\\n";\
            debugOutput += `${userResult.message}\\n`;\
          } else {\
            debugOutput += "--- USER MODE ---\\n";\
            debugOutput += `No information found for: ${intent.entity}\\n`;\
          }\
        } catch (err) {\
          debugOutput += "--- USER MODE ---\\n";\
          debugOutput += `Error generating user response: ${err.message}\\n`;\
        }\
      } else {\
        debugOutput += "--- USER MODE ---\\n";\
        debugOutput += `No matches found for: ${intent.entity}\\n`;\
      }\
      \
      debugOutput += `\\n${"=".repeat(60)}\\n`;' socketHandler.js

echo "Patch complete! The TODO section has been replaced with actual user response generation."
