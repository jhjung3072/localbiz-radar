#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RAW_DIR="$ROOT_DIR/docs/performance/raw"
ERROR_DIR="$RAW_DIR/errors"
LOG_FILE="$ERROR_DIR/a11y.log"
PORT="${PERF_WEB_PORT:-3100}"
SERVER_PID=""

mkdir -p "$RAW_DIR" "$ERROR_DIR"

write_failure() {
  local reason="$1"
  cat >"$RAW_DIR/a11y-current.json" <<JSON
{
  "status": "failed",
  "generatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
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
    PLAYWRIGHT_SKIP_WEB_SERVER=true PLAYWRIGHT_BASE_URL="http://localhost:$PORT" PERF_A11Y_REPORT=true pnpm --filter web e2e:a11y
) >>"$LOG_FILE" 2>&1; then
  write_failure "Playwright 접근성 측정 실패"
  exit 1
fi

node "$ROOT_DIR/apps/web/scripts/performance/summarize-a11y.mjs" >>"$LOG_FILE" 2>&1
