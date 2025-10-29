#!/usr/bin/env bash
set -euo pipefail

cd ~/Desktop/theexpanse/dossiers

for file in *.html; do
  cp "$file" "$file.bak"
  # Remove input file controls
  perl -0777 -i -pe 's{<input[^>]*type=["'"'"']file["'"'"'][^>]*>}{}gis' "$file"
  # Remove any button with id commitBtn (anywhere, multi-line ok)
  perl -0777 -i -pe 's{<button[^>]*id=["'"'"']commitBtn["'"'"'][^>]*>.*?</button>}{}gis' "$file"
  # Remove any button whose visible text is "Commit to Library"
  perl -0777 -i -pe 's{<button\b[^>]*>\s*Commit to Library\s*</button>}{}gis' "$file"
  # Remove all editor-only class divs
  perl -0777 -i -pe 's{<div[^>]*class=["'"'"']editor-only["'"'"'][^>]*>.*?</div>}{}gis' "$file"
  echo "[ok] Cleaned $file"
done
