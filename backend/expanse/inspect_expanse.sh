#!/usr/bin/env bash
set -e

echo "== server.js mounts and middleware =="
grep -nE "app.use\\(|express\\.|helmet\\(|cors\\(|static\\(" ../../server.js || true
echo

echo "== Expanse index.js router map =="
sed -n '1,120p' ./index.js
echo

echo "== councilChat.js head =="
sed -n '1,120p' ./routes/councilChat.js
echo

echo "== events.js head (if present) =="
if [ -f ./routes/events.js ]; then sed -n '1,120p' ./routes/events.js; else echo "routes/events.js not found"; fi
echo

echo "== Directory tree (expanse) =="
ls -la
echo
echo "routes/"
ls -la routes || true
echo
echo "services/"
ls -la services || true
echo

echo "== DB connection (pgPool.js location) =="
if [ -f ../../db/pgPool.js ]; then echo "../../db/pgPool.js exists"; sed -n '1,60p' ../../db/pgPool.js; else echo "pgPool.js not found at ../../db/pgPool.js"; fi
echo

echo "== API base and sample curls =="
echo "Base: http://localhost:3000/api/expanse"
echo "Chat: curl -X POST http://localhost:3000/api/expanse/council/chat -H 'Content-Type: application/json' -d '{\"message\":\"Who is <name>?\"}'"
echo "Event create: curl -X POST http://localhost:3000/api/expanse/events -H 'Content-Type: application/json' -d '{\"timestamp\":\"2025-11-05T00:00:00Z\",\"realm\":\"Earth\",\"location\":\"Meguro River\",\"event_type\":\"sighting\"}'"
