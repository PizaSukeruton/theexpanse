set -e
set -o pipefail

PROJ=~/Desktop/theexpanse
OUTDIR="$PROJ/reports/tse_audit_fast_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTDIR/scans"

find "$PROJ" -type f \( -name "*.js" -o -name "*.cjs" -o -name "*.mjs" -o -name "*.ts" -o -name "*.sql" -o -name "*.json" \) > "$OUTDIR/all_files.lst"
grep -E "/TSE/|/knowledge/|/engines/|/db/|/api/|/routes/" "$OUTDIR/all_files.lst" > "$OUTDIR/scope_files.lst" || true
wc -l $(cat "$OUTDIR/scope_files.lst") > "$OUTDIR/line_counts.txt" 2>/dev/null || true

grep -RIn --color=never -E "openai|anthropic|bedrock|cohere|vertex|groq|replicate|hf_\w+|api\.key|apiKey|Bearer " "$PROJ" > "$OUTDIR/scans/outside_ai_hits.txt" || true
grep -RIn --color=never -E "(Math\.random|mock\s*data|hardcoded|hard-coded|HARDCODED|TODO[^A-Za-z]|FIXME)" "$PROJ" > "$OUTDIR/scans/mock_and_todo_hits.txt" || true
grep -RIn --color=never -E "#[0-9A-F]{6}" "$PROJ" > "$OUTDIR/scans/hex_ids_usage.txt" || true
grep -RIn --color=never -E "cycle_id|tse_cycles|SUBSTR\(cycle_id, 2\)|\bLIKE\s*'#|~\s*'\^#\[0-9A-F\]\{6\}\$'" "$PROJ" > "$OUTDIR/scans/cycle_id_logic.txt" || true
grep -RIn --color=never -E "\bPOW\s*\(" "$PROJ" > "$OUTDIR/scans/sql_pow_uses.txt" || true
grep -RIn --color=never -E "\bPOWER\s*\(" "$PROJ" > "$OUTDIR/scans/sql_power_uses.txt" || true
grep -RIn --color=never -E "metadata\s*\|\|" "$PROJ" > "$OUTDIR/scans/json_merge_metadata.txt" || true
grep -RIn --color=never -E "COALESCE\s*\(\s*metadata\s*,\s*'\{\}'::jsonb\s*\)\s*\|\|" "$PROJ" > "$OUTDIR/scans/json_merge_metadata_coalesced.txt" || true
grep -RIn --color=never -E "ILIKE\s+ANY|ILIKE\s+'%|ILIKE\s*\(" "$PROJ/backend" > "$OUTDIR/scans/ilike_usage.txt" || true
grep -RIn --color=never -E "path-to-regexp|/:id|router\.param\(|new RegExp\(.*/:.*\)" "$PROJ" > "$OUTDIR/scans/dynamic_routes_hits.txt" || true
grep -RIn --color=never -E "startKnowledgeCycle|generateKnowledgeResponse|KnowledgeResponseEngine|retrieveRelevantKnowledge|character_knowledge_state|knowledge_review_logs" "$PROJ" > "$OUTDIR/scans/knowledge_flow.txt" || true

R="$OUTDIR"
OUT="$R/summary.txt"
{
  echo "Audit: $(date)"
  echo
  echo "[Files in scope]"
  wc -l $(cat "$R/scope_files.lst") 2>/dev/null || true
  echo
  for f in outside_ai_hits.txt mock_and_todo_hits.txt sql_pow_uses.txt json_merge_metadata.txt json_merge_metadata_coalesced.txt dynamic_routes_hits.txt ilike_usage.txt cycle_id_logic.txt knowledge_flow.txt; do
    echo "==== $f ===="
    if [ -s "$R/scans/$f" ]; then
      sed -n '1,200p' "$R/scans/$f"
    else
      echo "(no hits)"
    fi
    echo
  done
} > "$OUT"

echo "$OUT"
