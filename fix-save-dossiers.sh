#!/usr/bin/env bash
set -euo pipefail

cd ~/Desktop/theexpanse
cp server.js server.js.bak

# Find the line with fs.writeFileSync and display context
echo "Searching for dossier save function..."
grep -n "fs.writeFileSync" server.js || { echo "No matching line found."; exit 1; }

# Automatically patch inside save-dossier route
sed -i '' '/fs\.writeFileSync(filePath, content);/{
i\
  // Clean editor-only controls before saving\
  const cleanContent = content\
    .replace(/<input[^>]*type=["'\''"]file["'\''"][^>]*>/gi, "")\
    .replace(/<button[^>]*id=["'\''"]commitBtn["'\''"][^>]*>.*?<\/button>/gis, "")\
    .replace(/<button\b[^>]*>\s*Commit to Library\s*<\/button>/gi, "")\
    .replace(/<div[^>]*class=["'\''"]editor-only["'\''"][^>]*>.*?<\/div>/gis, "");\
  fs.writeFileSync(filePath, cleanContent);
d
}' server.js

echo "[ok] Patched server.js – cleaning logic added (backup in server.js.bak)"
