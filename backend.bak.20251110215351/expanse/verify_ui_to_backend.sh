#!/usr/bin/env bash
set -e

echo "== Verify terminal endpoint is mounted =="
grep -n "/api/terminal" ../../server.js

echo
echo "== Sanity POST to /api/terminal/query =="
curl -s -X POST http://localhost:3000/api/terminal/query \
  -H "Content-Type: application/json" \
  -d '{"question":"who is piza sukeruton?"}' | sed 's/\\\//\//g' | head -c 600
echo

echo
echo "== Open the UI in a browser (manual) =="
echo "Visit: http://localhost:3000/terminal.html"
echo "Login flow in the UI expects 'who is piza sukeruton' to unlock, then it will POST to /api/terminal/query"
