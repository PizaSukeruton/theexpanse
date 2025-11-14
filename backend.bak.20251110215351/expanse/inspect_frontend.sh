#!/usr/bin/env bash
set -e

echo "== Static site roots served by server.js =="
grep -nE "express\\.static|app\\.use\\(.*public\\)" ../../server.js || true
echo

echo "== Public directory (static assets) =="
ls -la ../../public || echo "public/ not found"
echo

echo "== Frontend HTML candidates in public/ =="
find ../../public -maxdepth 2 -type f -name "*.html" -print || true
echo

echo "== JS entrypoints in public/ =="
find ../../public -maxdepth 2 -type f -name "*.js" -print || true
echo

echo "== Frontend services in this module (expanse/services) =="
ls -la ./services || true
echo
find ./services -type f -maxdepth 2 -name "*.js" -print || true
echo

echo "== Intent engine files (high-level) =="
wc -l ./services/tmAiEngine.js ./services/tmIntentMatcher.js ./services/tmMessageProcessor.js 2>/dev/null || true
echo

echo "== Routes exposing UI endpoints (lore-admin, terminal) =="
sed -n '1,200p' ../../routes/terminal.js 2>/dev/null || echo "No routes/terminal.js at project root"
echo
sed -n '1,200p' ../../routes/lore-admin.js 2>/dev/null || echo "No routes/lore-admin.js at project root"
echo

echo "== Known API base you can call from frontend =="
echo "Fetch base: /api/expanse"
echo "Council chat: POST /api/expanse/council/chat  { message }"
echo "Events: POST /api/expanse/events  { timestamp, realm, location, event_type, ... }"
