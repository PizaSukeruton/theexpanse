perl -0777 -pi -e '
  s|
      await pool\.query\(\s*query,\s*\[|
      console.log("AUDIT INSERT PARAMS:", {
        usageId: usageId,
        characterId: characterId,
        vocabWord: vocabItem.word,
        category: category,
        intent: intent,
        level: level,
        safeTaskRef: safeTaskRef
      });
      if (String(usageId).length > 7) {
        console.error("CRITICAL_OVERFLOW usageId len=" + String(usageId).length);
        throw new Error("usageId overflow");
      }
      if (String(characterId).length > 7) {
        console.error("CRITICAL_OVERFLOW characterId len=" + String(characterId).length);
        throw new Error("characterId overflow");
      }
      await pool.query(query, [|
  |x
' ~/desktop/theexpanse/theexpansev005/backend/TSE/TanukiEngine/MechanicalBrain_v2.js
