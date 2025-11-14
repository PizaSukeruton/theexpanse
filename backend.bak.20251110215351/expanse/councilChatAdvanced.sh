#!/usr/bin/env bash
set -euo pipefail
BASE="http://localhost:3000/api/expanse/council/chat"
HDR="Content-Type: application/json"

# Existing checks
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"Show details for event #C90003."}' | jq .
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"Who was involved in event #C90003 at Meguro River?"}' | jq .
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"What events happened at Meguro River?"}' | jq .

# New: list by type
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"List events with event_type sighting"}' | jq .

# New: since date
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"List events since 2025-11-01"}' | jq .

# New: fuzzy search
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"Find events near river"}' | jq .
