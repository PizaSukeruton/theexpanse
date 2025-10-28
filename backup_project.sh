#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="backup-${STAMP}.tar.gz"

echo "Backing up from: ${ROOT_DIR}"
echo "Creating: ${OUT}"

# Create a file list excluding common dirs
EXCLUDES=(
  "./node_modules"
  "./.git"
  "./.DS_Store"
  "./backup-*.tar.gz"
)

# Build find expression to exclude patterns
find . \
  -path "./node_modules" -prune -o \
  -path "./.git" -prune -o \
  -name ".DS_Store" -prune -o \
  -name "backup-*.tar.gz" -prune -o \
  -print \
| tar -czf "${OUT}" -T -

echo "Backup complete: ${OUT}"
