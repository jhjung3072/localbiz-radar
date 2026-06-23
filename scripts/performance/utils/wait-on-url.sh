#!/usr/bin/env bash
set -u

url="${1:?Usage: wait-on-url.sh <url> [timeout_seconds]}"
timeout_seconds="${2:-90}"
started_at="$(date +%s)"

while true; do
  if curl -fsS "$url" >/dev/null 2>&1; then
    exit 0
  fi

  now="$(date +%s)"
  if [ "$((now - started_at))" -ge "$timeout_seconds" ]; then
    echo "Timed out waiting for $url after ${timeout_seconds}s" >&2
    exit 1
  fi

  sleep 2
done
