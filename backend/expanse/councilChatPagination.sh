#!/usr/bin/env bash
set -euo pipefail
BASE="http://localhost:3000/api/expanse/council/chat"
HDR="Content-Type: application/json"

# Type + pagination
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"List events with event_type sighting limit 1 offset 0"}' | jq .
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"List events with event_type sighting limit 1 offset 1"}' | jq .

# Since + pagination
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"List events since 2025-10-01 limit 1 offset 0"}' | jq .
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"List events since 2025-10-01 limit 1 offset 1"}' | jq .

# Fuzzy + pagination
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"Find events near river limit 1 offset 0"}' | jq .
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"Find events near river limit 1 offset 1"}' | jq .
