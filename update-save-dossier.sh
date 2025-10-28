#!/usr/bin/env bash
set -euo pipefail

cd ~/Desktop/theexpanse
cp server.js server.js.bak

node <<'JS'
import fs from "fs";
const f = "server.js";
let code = fs.readFileSync(f, "utf8");

const search = 'fs.writeFileSync(filePath, content);';
const replace = `
// Clean undesirable editor sections before saving
const cleanContent = content
  .replace(/<input[^>]*type=["']file["'][^>]*>/gi, "")
  .replace(/<button[^>]*id=["']commitBtn["'][^>]*>.*?<\\/button>/gis, "")
  .replace(/<div[^>]*class=["']editor-only["'][^>]*>.*?<\\/div>/gis, "");
fs.writeFileSync(filePath, cleanContent);
`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync(f, code);
  console.log("[ok] server.js upgraded — now strips file inputs, commit buttons, and editor-only divs.");
} else {
  console.log("[skip] No matching fs.writeFileSync(filePath, content); found.");
}
JS
