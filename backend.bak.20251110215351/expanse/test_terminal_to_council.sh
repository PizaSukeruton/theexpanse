#!/usr/bin/env bash
set -e

echo "== Direct council chat (control) =="
curl -s -X POST http://localhost:3000/api/expanse/council/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Who is Piza Sukeruton?"}' | jq .
echo

echo "== Terminal endpoint (current) =="
curl -s -X POST http://localhost:3000/api/terminal/query \
  -H "Content-Type: application/json" \
  -d '{"question":"Who is Piza Sukeruton?"}' | jq .
echo

echo "== If terminal returns empty, TerminalCore likely uses a different store.
Consider adapting TerminalCore to proxy specific patterns to council chat for now."
