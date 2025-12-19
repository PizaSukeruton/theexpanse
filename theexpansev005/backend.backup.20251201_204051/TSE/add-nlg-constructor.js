import fs from 'fs';

const file = fs.readFileSync('TSELoopManager.js', 'utf8');

const constructorInit = `        this.intentSchema = IntentSchema;
        this.fsrsRetrieval = FSRSRetrievalBridge;
        this.memoryCluster = MemoryClusterManager;
        this.personalityEngine = CharacterPersonalityEngine;`;

const updated = file.replace(
    "        this.accuracyScorer = new AccuracyScorer();",
    "        this.accuracyScorer = new AccuracyScorer();\n\n" + constructorInit
);

fs.writeFileSync('TSELoopManager.js', updated);
console.log('✓ NLG constructor initialization added');
