#!/usr/bin/env bash
set -euo pipefail

in="dossier-template.html"
if [ ! -f "$in" ]; then
  echo >&2 "No dossier-template.html found in $(pwd)."
  exit 1
fi
cp "$in" "$in.bak"

perl -0777 -i -pe '
  s{<input\b[^>]*\bid\s*=\s*["'\''"]fileInput["'\''"][^>]*>}{}gis;
  s{<button\b[^>]*\bid\s*=\s*["'\''"]commitBtn["'\''"][^>]*>.*?</button>}{}gis;
' "$in"

echo "[ok] Stripped editor controls from $in (backup at $in.bak)"
