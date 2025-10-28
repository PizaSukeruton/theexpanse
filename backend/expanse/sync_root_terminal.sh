#!/usr/bin/env bash
set -e

ROOT_TERMINAL=./routes/terminal.js
EXPANSE_TERMINAL=./backend/expanse/routes/terminal.js

echo "== Checking root routes/terminal.js =="
if [ -f "$ROOT_TERMINAL" ]; then
  echo "Root routes/terminal.js exists. Showing first 20 lines:"
  sed -n '1,20p' "$ROOT_TERMINAL"
else
  echo "Root routes/terminal.js missing. Creating from expanse proxy version..."
  mkdir -p ./routes
  if [ -f "$EXPANSE_TERMINAL" ]; then
    cp "$EXPANSE_TERMINAL" "$ROOT_TERMINAL"
  else
    # Fallback minimal router to avoid import error
    cat > "$ROOT_TERMINAL" <<'EOT'
import express from 'express';
const router = express.Router();
router.post('/query', (req, res) => {
  res.json({ data: [], message: 'ok', access_level: 0 });
});
export default router;
EOT
  fi
fi

echo
echo "== Verifying export =="
grep -n "export default router" "$ROOT_TERMINAL" || (echo "Default export not found in root router" && exit 1)

echo
echo "== Confirm server.js imports root routes/terminal.js =="
grep -n "import .* from \"\\./routes/terminal.js\"" ./server.js || true
