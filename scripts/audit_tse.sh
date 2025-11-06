set -e
set -o pipefail

PROJ=~/Desktop/theexpanse
OUTDIR="$PROJ/reports/tse_audit_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTDIR"

printf "%s\n" "$PROJ" > "$OUTDIR/project_root.txt"

find "$PROJ" -type f \( -name "*.js" -o -name "*.cjs" -o -name "*.mjs" -o -name "*.ts" -o -name "*.sql" -o -name "*.json" \) > "$OUTDIR/all_files.lst"
grep -E "/TSE/|/knowledge/|/engines/|/db/|/api/|/routes/" "$OUTDIR/all_files.lst" > "$OUTDIR/scope_files.lst" || true

wc -l $(cat "$OUTDIR/scope_files.lst") > "$OUTDIR/line_counts.txt"

mkdir -p "$OUTDIR/copies"
rsync -a --files-from="$OUTDIR/scope_files.lst" / "$OUTDIR/copies/"

mkdir -p "$OUTDIR/scans"

grep -RIn --line-number --color=never -E "openai|anthropic|bedrock|cohere|vertex|groq|replicate|hf_\w+|api\.key|apiKey|Bearer " "$PROJ" > "$OUTDIR/scans/outside_ai_hits.txt" || true

grep -RIn --line-number --color=never -E "(Math\.random|mock\s*data|hardcoded|hard-coded|HARDCODED|TODO[^A-Za-z]|FIXME)" "$PROJ" > "$OUTDIR/scans/mock_and_todo_hits.txt" || true

grep -RIn --line-number --color=never -E "#[0-9A-F]{6}" "$PROJ" > "$OUTDIR/scans/hex_ids_usage.txt" || true

grep -RIn --line-number --color=never -E "cycle_id|tse_cycles|SUBSTR\(cycle_id, 2\)|\bLIKE\s*'#|~\s*'\^#\[0-9A-F\]\{6\}\$'" "$PROJ" > "$OUTDIR/scans/cycle_id_logic.txt" || true

grep -RIn --line-number --color=never -E "\bPOW\s*\(" "$PROJ" > "$OUTDIR/scans/sql_pow_uses.txt" || true
grep -RIn --line-number --color=never -E "\bPOWER\s*\(" "$PROJ" > "$OUTDIR/scans/sql_power_uses.txt" || true

grep -RIn --line-number --color=never -E "metadata\s*\|\|" "$PROJ" > "$OUTDIR/scans/json_merge_metadata.txt" || true
grep -RIn --line-number --color=never -E "COALESCE\s*\(\s*metadata\s*,\s*'\{\}'::jsonb\s*\)\s*\|\|" "$PROJ" > "$OUTDIR/scans/json_merge_metadata_coalesced.txt" || true

grep -RIn --line-number --color=never -E "ILIKE\s+ANY|ILIKE\s+'%|ILIKE\s*\(" "$PROJ/backend" > "$OUTDIR/scans/ilike_usage.txt" || true

grep -RIn --line-number --color=never -E "path-to-regexp|/:id|router\.param\(|new RegExp\(.*/:.*\)" "$PROJ" > "$OUTDIR/scans/dynamic_routes_hits.txt" || true

grep -RIn --line-number --color=never -E "record_id|teacherRecord|studentAttempt|evaluation_id|coding_training|knowledge_learning" "$PROJ/backend/TSE" > "$OUTDIR/scans/tse_fk_and_types.txt" || true

grep -RIn --line-number --color=never -E "startKnowledgeCycle|generateKnowledgeResponse|KnowledgeResponseEngine|retrieveRelevantKnowledge|character_knowledge_state|knowledge_review_logs" "$PROJ" > "$OUTDIR/scans/knowledge_flow.txt" || true

find "$PROJ" -type f -name "index.js" -maxdepth 5 -path "*/backend/TSE/*" -print0 | xargs -0 cat > "$OUTDIR/tse_routes_index.js.dump" || true

echo "OK" > "$OUTDIR/_audit_complete"
printf "%s\n" "$OUTDIR"
