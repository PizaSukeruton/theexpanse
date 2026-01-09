perl -0777 -pi -e '
  s/await this.levelSystem.updateLevel\(/console.log("DEBUG triggeredby:", "modeDetector");\n    await this.levelSystem.updateLevel(/g
' backend/TSE/TanukiEngine/MechanicalBrain_v2.js
