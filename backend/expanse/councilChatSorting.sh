#!/usr/bin/env bash
set -euo pipefail
BASE="http://localhost:3000/api/expanse/council/chat"
HDR="Content-Type: application/json"

# Realm filter + sort + pagination
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"List events in realm earth sort asc limit 1 offset 0"}' | jq .
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"List events in realm earth sort asc limit 1 offset 1"}' | jq .

# Since + sort
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"List events since 2025-10-01 sort asc limit 2"}' | jq .

# Combined: location + since + sort + pagination
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"List events at meguro river since 2025-10-01 sort asc limit 1 offset 0"}' | jq .
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"List events at meguro river since 2025-10-01 sort asc limit 1 offset 1"}' | jq .

# Validation check (bad date)
curl -s -X POST "$BASE" -H "$HDR" -d '{"message":"List events since not-a-date"}' | jq .
