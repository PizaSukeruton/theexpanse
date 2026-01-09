perl -0777 -pi -e '
  s/constructor[^\{]*\{/constructor() {/;
' ~/desktop/theexpanse/theexpansev005/backend/TSE/TanukiEngine/MechanicalBrain_v2.js
