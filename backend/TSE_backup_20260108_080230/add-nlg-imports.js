import fs from 'fs';

const file = fs.readFileSync('TSELoopManager.js', 'utf8');

const newImports = `import IntentSchema from '../nlg-engine/IntentSchema.js';
import FSRSRetrievalBridge from '../nlg-engine/FSRSRetrievalBridge.js';
import MemoryClusterManager from '../nlg-engine/MemoryClusterManager.js';
import CharacterPersonalityEngine from '../nlg-engine/CharacterPersonalityEngine.js';`;

const updated = file.replace(
    "import AccuracyScorer from './AccuracyScorer.js';",
    "import AccuracyScorer from './AccuracyScorer.js';\n" + newImports
);

fs.writeFileSync('TSELoopManager.js', updated);
console.log('✓ NLG imports added');
