#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RAW_DIR="$ROOT_DIR/docs/performance/raw"
ERROR_DIR="$RAW_DIR/errors"
LOG_FILE="$ERROR_DIR/stores-search.log"
PORT="${PERF_WEB_PORT:-3100}"
SERVER_PID=""
LABEL="${PERF_STORES_SEARCH_LABEL:-current}"
OUTPUT="${PERF_STORES_SEARCH_OUTPUT:-$RAW_DIR/stores-search-current.json}"

mkdir -p "$RAW_DIR" "$ERROR_DIR"

write_failure() {
  local reason="$1"
  cat >"$OUTPUT" <<JSON
{
  "status": "failed",
  "generatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "label": "$LABEL",
  "reason": "$reason",
  "logFile": "$LOG_FILE"
}
JSON
}

cleanup() {
  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

if ! (
  cd "$ROOT_DIR" &&
    NEXT_PUBLIC_ENABLE_PERF_LAB=true pnpm --filter web build
) >"$LOG_FILE" 2>&1; then
  write_failure "production build 실패"
  exit 1
fi

(
  cd "$ROOT_DIR" &&
    NEXT_PUBLIC_ENABLE_PERF_LAB=true pnpm --filter web exec next start -p "$PORT"
) >>"$LOG_FILE" 2>&1 &
SERVER_PID="$!"

if ! "$ROOT_DIR/scripts/performance/utils/wait-on-url.sh" "http://localhost:$PORT" 90 >>"$LOG_FILE" 2>&1; then
  write_failure "web server start 실패"
  exit 1
fi

if ! (
  cd "$ROOT_DIR" &&
    PERF_BASE_URL="http://localhost:$PORT" \
      PERF_STORES_SEARCH_LABEL="$LABEL" \
      PERF_STORES_SEARCH_OUTPUT="$OUTPUT" \
      node scripts/performance/utils/measure-stores-search.mjs
) >>"$LOG_FILE" 2>&1; then
  write_failure "Playwright 점포 검색 호출 수 측정 실패"
  exit 1
fi
