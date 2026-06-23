#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RAW_DIR="$ROOT_DIR/docs/performance/raw"
ERROR_DIR="$RAW_DIR/errors"
NOTES_FILE="$ROOT_DIR/docs/performance/00-measurement-notes.md"
REPORT_FILE="$ROOT_DIR/docs/performance/01-bff-before-after.md"
WORKTREE_DIR="$ROOT_DIR/.perf-worktrees"
BEFORE_REF="${BFF_BEFORE_REF:-e224462}"
AFTER_REF="${BFF_AFTER_REF:-HEAD}"
RESOLVED_AFTER_REF="$(git -C "$ROOT_DIR" rev-parse --short "$AFTER_REF" 2>/dev/null || echo "$AFTER_REF")"
BACKEND_URL="${SPRING_API_BASE_URL:-http://localhost:8080}"
BACKEND_HEALTH_URL="${BACKEND_HEALTH_URL:-$BACKEND_URL/api/health}"

ensure_worktree() {
  local dir="$1"
  local ref="$2"

  if [ -d "$dir/.git" ] || [ -f "$dir/.git" ]; then
    return
  fi

  git -C "$ROOT_DIR" worktree add "$dir" "$ref"
}

measure_worktree() {
  local label="$1"
  local dir="$2"
  local port="$3"
  local output="$4"
  local ref="$5"
  local log_file="$ERROR_DIR/bff-${label}.log"

  if ! (
    cd "$dir" &&
      pnpm install --frozen-lockfile &&
      SPRING_API_BASE_URL="$BACKEND_URL" NEXT_PUBLIC_API_BASE_URL="$BACKEND_URL" pnpm --filter web build
  ) >"$log_file" 2>&1; then
    write_error_raw "$output" "$label" "$ref" "production build 실패" "$log_file"
    append_note "BFF $label 측정 실패: production build 실패. 로그: $log_file"
    return
  fi

  (
    cd "$dir" &&
      SPRING_API_BASE_URL="$BACKEND_URL" NEXT_PUBLIC_API_BASE_URL="$BACKEND_URL" pnpm --filter web exec next start -p "$port"
  ) >>"$log_file" 2>&1 &
  pids+=("$!")

  if ! "$ROOT_DIR/scripts/performance/utils/wait-on-url.sh" "http://localhost:$port" 90 >>"$log_file" 2>&1; then
    write_error_raw "$output" "$label" "$ref" "web server start 실패" "$log_file"
    append_note "BFF $label 측정 실패: web server start 실패. 로그: $log_file"
    return
  fi

  node "$ROOT_DIR/scripts/performance/utils/collect-bff-metrics.mjs" \
    --base-url "http://localhost:$port" \
    --output "$output" \
    --label "$label" \
    --git-ref "$ref" >>"$log_file" 2>&1 || {
    write_error_raw "$output" "$label" "$ref" "browser metric 수집 실패" "$log_file"
    append_note "BFF $label 측정 실패: browser metric 수집 실패. 로그: $log_file"
  }
}

write_skipped_raw() {
  local output="$1"
  local label="$2"

  cat >"$output" <<JSON
{
  "status": "skipped",
  "generatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "label": "$label",
  "reason": "backend health check failed",
  "backendHealthUrl": "$BACKEND_HEALTH_URL"
}
JSON
}

write_error_raw() {
  local output="$1"
  local label="$2"
  local ref="$3"
  local reason="$4"
  local log_file="$5"

  cat >"$output" <<JSON
{
  "status": "failed",
  "generatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "label": "$label",
  "gitRef": "$ref",
  "reason": "$reason",
  "logFile": "$log_file"
}
JSON
}

append_note() {
  local message="$1"
  {
    echo ""
    echo "## $(date +"%Y-%m-%d %H:%M:%S")"
    echo ""
    echo "- $message"
  } >>"$NOTES_FILE"
}

write_bff_report() {
  local status="$1"

  cat >"$REPORT_FILE" <<MD
# BFF 적용 전/후 성능 비교

## 1. 측정 대상

/dashboard, /compare, /stores의 브라우저 request 수와 초기 렌더링 지표.

## 2. Before 기준 git ref

$BEFORE_REF

## 3. After 기준 git ref

after: $RESOLVED_AFTER_REF, 측정 당시 HEAD

## 4. Before 구조 설명

BFF 적용 전에는 브라우저가 Spring Boot /api/** endpoint를 직접 호출하는 구조다.

## 5. After 구조 설명

BFF 적용 후에는 Server Component와 Next.js Route Handler가 화면 단위 bootstrap 데이터를 조립하고, 브라우저는 필요한 경우 /bff/** 또는 기존 상호작용 API를 호출한다.

## 6. 적용된 개선 방식

Next.js BFF aggregate, Server Component 초기 데이터 조립, React Query 초기 캐시 구성.

## 7. 관련 변경 파일

- apps/web/src/app/bff/**
- apps/web/src/features/bff/**
- apps/web/src/features/dashboard/server/get-dashboard-bootstrap.ts
- apps/web/src/features/compare/server/get-compare-bootstrap.ts
- apps/web/src/features/explore/server/get-stores-bootstrap.ts

## 8. 측정 지표

LCP, TBT, CLS, JS transfer size, /api/** 요청 수, /bff/** 요청 수, 초기 화면 완료 시간, network waterfall 시간.

## 9. Before 수치

docs/performance/raw/bff-before.json 참고. 측정 상태: $status

## 10. After 수치

docs/performance/raw/bff-after.json 참고. 측정 상태: $status

## 11. 개선 폭

raw JSON에 before/after 실제 수치가 모두 있을 때만 계산한다. 현재 자동 리포트에서는 TODO 또는 측정 실패 사유를 남긴다.

## 12. raw JSON 근거 파일 경로

- docs/performance/raw/bff-before.json
- docs/performance/raw/bff-after.json

## 13. 주요 개선 수치

TODO: before/after 실제 수치가 모두 확보된 뒤 확정한다.

## 14. 측정 해석

Dashboard, Compare, Stores는 기존에 브라우저에서 여러 API를 직접 호출하던 흐름을 Next.js 서버 계층에서 화면 단위 bootstrap으로 조립하도록 바꾼 구조다. 실제 request 수와 LCP 개선은 raw 측정값이 확보된 뒤 수치로 설명한다.

## 15. 측정 한계와 주의사항

backend가 실행되지 않으면 BFF 측정은 실패로 기록한다. serviceKey, JWT, cookie, Sentry token은 로그에 남기지 않는다.
MD
}

mkdir -p "$RAW_DIR" "$ERROR_DIR" "$(dirname "$NOTES_FILE")" "$WORKTREE_DIR"
touch "$NOTES_FILE"

if ! curl -fsS "$BACKEND_HEALTH_URL" >/dev/null 2>&1; then
  write_skipped_raw "$RAW_DIR/bff-before.json" "before"
  write_skipped_raw "$RAW_DIR/bff-after.json" "after"
  append_note "BFF before/after 측정 실패: backend health check 실패 ($BACKEND_HEALTH_URL)"
  write_bff_report "backend health check 실패"
  exit 0
fi

before_dir="$WORKTREE_DIR/bff-before"
after_dir="$WORKTREE_DIR/bff-after"
before_port="${BFF_BEFORE_PORT:-3101}"
after_port="${BFF_AFTER_PORT:-3102}"
pids=()

cleanup_servers() {
  for pid in "${pids[@]}"; do
    kill "$pid" >/dev/null 2>&1 || true
  done
}
trap cleanup_servers EXIT

ensure_worktree "$before_dir" "$BEFORE_REF"
ensure_worktree "$after_dir" "$AFTER_REF"

measure_worktree "before" "$before_dir" "$before_port" "$RAW_DIR/bff-before.json" "$BEFORE_REF"
measure_worktree "after" "$after_dir" "$after_port" "$RAW_DIR/bff-after.json" "$RESOLVED_AFTER_REF"
write_bff_report "측정 완료 또는 부분 완료"
node "$ROOT_DIR/scripts/performance/utils/summarize-bff.mjs" >/dev/null 2>&1 || true
