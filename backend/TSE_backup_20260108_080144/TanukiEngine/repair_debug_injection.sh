perl -0777 -pi -e '
  s/console\.log\("([\s\S]*?)debugCheck\("characterId", characterId, 7\);\n//g;
' ~/desktop/theexpanse/theexpansev005/backend/TSE/TanukiEngine/MechanicalBrain_v2.js
