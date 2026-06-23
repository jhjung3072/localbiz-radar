#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RAW_DIR="$ROOT_DIR/docs/performance/raw"
ERROR_DIR="$RAW_DIR/errors"
NOTES_FILE="$ROOT_DIR/docs/performance/00-measurement-notes.md"

mkdir -p "$ERROR_DIR"
touch "$NOTES_FILE"

run_step() {
  local name="$1"
  local command="$2"
  local log_file="$ERROR_DIR/${name}.log"

  echo "==> $name"
  if ! bash -lc "$command" >"$log_file" 2>&1; then
    {
      echo ""
      echo "## $(date +"%Y-%m-%d %H:%M:%S")"
      echo ""
      echo "- $name 실패. 로그: $log_file"
    } >>"$NOTES_FILE"
  fi
}

run_step "bff-before-after" "cd '$ROOT_DIR' && bash scripts/performance/measure-bff-before-after.sh"
run_step "large-list" "cd '$ROOT_DIR' && bash scripts/performance/measure-large-list.sh"
run_step "lighthouse-current" "cd '$ROOT_DIR' && bash scripts/performance/measure-current-lighthouse.sh"
run_step "bundle" "cd '$ROOT_DIR' && bash scripts/performance/measure-bundle.sh"
run_step "a11y" "cd '$ROOT_DIR' && bash scripts/performance/measure-a11y.sh"
run_step "stores-search" "cd '$ROOT_DIR' && bash scripts/performance/measure-stores-search.sh"

node "$ROOT_DIR/scripts/performance/utils/summarize-results.mjs"
