#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RAW_DIR="$ROOT_DIR/docs/performance/raw"
ERROR_DIR="$RAW_DIR/errors"
LOG_FILE="$ERROR_DIR/bundle.log"

mkdir -p "$RAW_DIR" "$ERROR_DIR"

if ! (
  cd "$ROOT_DIR" &&
    ANALYZE=true NEXT_PUBLIC_ENABLE_PERF_LAB=true pnpm --filter web build
) >"$LOG_FILE" 2>&1; then
  cat >"$RAW_DIR/bundle-current.json" <<JSON
{
  "status": "failed",
  "generatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "reason": "bundle analyzer build 실패",
  "logFile": "$LOG_FILE"
}
JSON
  exit 1
fi

(
  cd "$ROOT_DIR" &&
    pnpm --filter web exec next experimental-analyze -o
) >>"$LOG_FILE" 2>&1 || true

node "$ROOT_DIR/apps/web/scripts/performance/summarize-bundle.mjs" >>"$LOG_FILE" 2>&1
