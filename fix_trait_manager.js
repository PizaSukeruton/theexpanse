import fs from 'fs';

const filePath = './backend/traits/TraitManager.js';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the export syntax - likely an object export that wasn't converted properly
content = content.replace(/export\s*{\s*getTraitVector:\s*traitManagerInstance\.getTraitVector\.bind\(traitManagerInstance\),?\s*}/g, 
    'export { getTraitVector };');

// If there's a trailing export object with methods, fix it
content = content.replace(/export\s*{([^}]*):([^}]*)\}/g, 
    (match, key, value) => {
        if (key.includes(':')) {
            // Malformed export, fix it
            return `export default traitManagerInstance;`;
        }
        return match;
    });

fs.writeFileSync(filePath, content);
console.log('✓ Fixed TraitManager export syntax');
