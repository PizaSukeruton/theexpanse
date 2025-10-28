#!/usr/bin/env bash
set -euo pipefail
cd ~/Desktop/theexpanse/public
in="dossier-template.html"
[ -f "\$in" ] || { echo >&2 "No dossier-template.html found!"; exit 1; }
cp "\$in" "\$in.bak"

perl -0777 -i -pe '
  s{<input\b[^>]*\bid\s*=\s*["'\''"]fileInput["'\''"][^>]*>}{}gis;
  s{<button\b[^>]*\bid\s*=\s*["'\''"]commitBtn["'\''"][^>]*>.*?</button>}{}gis;
' "\$in"

echo "[ok] Stripped editor controls from \$in (backup at \$in.bak)"
