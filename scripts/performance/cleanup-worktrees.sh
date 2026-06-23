#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORKTREE_DIR="$ROOT_DIR/.perf-worktrees"

if [ ! -d "$WORKTREE_DIR" ]; then
  echo "No performance worktrees found."
  exit 0
fi

for worktree in "$WORKTREE_DIR"/*; do
  [ -d "$worktree" ] || continue
  git -C "$ROOT_DIR" worktree remove --force "$worktree" >/dev/null 2>&1 || rm -rf "$worktree"
done

rmdir "$WORKTREE_DIR" >/dev/null 2>&1 || true
echo "Performance worktrees cleaned up."
