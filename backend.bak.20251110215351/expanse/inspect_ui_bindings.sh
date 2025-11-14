#!/usr/bin/env bash
set -e

echo "== public/index.html (entry) =="
sed -n '1,200p' ../../public/index.html 2>/dev/null || echo "No public/index.html"
echo

echo "== public/terminal.html (interactive UI) =="
sed -n '1,200p' ../../public/terminal.html 2>/dev/null || echo "No public/terminal.html"
echo

echo "== public/terminal-integration.js (frontend logic) =="
sed -n '1,200p' ../../public/terminal-integration.js 2>/dev/null || echo "No public/terminal-integration.js"
echo

echo "== public/terminal-fix.js (frontend fixes) =="
sed -n '1,160p' ../../public/terminal-fix.js 2>/dev/null || echo "No public/terminal-fix.js"
echo

echo "== terminal routes (backend) =="
sed -n '1,200p' ../../routes/terminal.js 2>/dev/null || echo "No routes/terminal.js at project root"
echo

echo "== inferred front-end API calls =="
echo "- The terminal UI likely POSTs to /api/terminal/query with { question }"
echo "- Static assets are served from /public; open http://localhost:3000/terminal.html"
echo "- Admin/editor UIs under /public/* use lore routes under /api/lore/*"
