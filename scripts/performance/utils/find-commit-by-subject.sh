#!/usr/bin/env bash
set -u

subject="${1:?Usage: find-commit-by-subject.sh <subject>}"

git log --all --format='%H%x09%s' | awk -F '\t' -v subject="$subject" '$2 == subject { print $1; exit }'
