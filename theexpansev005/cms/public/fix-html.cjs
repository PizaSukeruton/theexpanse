const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(/char\.name/g, 'char.character_name');

fs.writeFileSync('index.html', content);
console.log('Fixed: HTML now uses character_name');
