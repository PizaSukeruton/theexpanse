const fs = require('fs');
const path = require('path');

const seen = new Set();
const root = path.resolve('server.js');

function walk(file) {
  if (!fs.existsSync(file) || seen.has(file)) return;
  seen.add(file);

  const src = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);

  const re = /(require\(['"](.+?)['"]\))|(import .* from ['"](.+?)['"])/g;
  let m;

  while ((m = re.exec(src))) {
    const dep = m[2] || m[4];
    if (!dep || !dep.startsWith('.')) continue;

    const resolved = path.resolve(
      dir,
      dep.endsWith('.js') ? dep : dep + '.js'
    );
    walk(resolved);
  }
}

walk(root);
console.log([...seen].sort().join('\n'));
