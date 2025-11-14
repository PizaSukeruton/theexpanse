#!/usr/bin/env bash
set -euo pipefail

BASE="http://localhost:3000/api/expanse/council/chat"
HDR="Content-Type: application/json"

# Characters
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"Who is Piza Sukeruton?"}' | jq .

# Locations
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"Where is Earth Realm?"}' | jq .
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"Where is the Test?"}' | jq .

# Arcs (requires you to add handler for 'show arc' and title searches)
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"Show arc #301DBF."}' | jq .
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"What is the Omega Aperture arc?"}' | jq .

# Events (requires you to add handler for events)
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"Show details for event #C90003."}' | jq .
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"Who was involved in event #C90003 at Meguro River?"}' | jq .
