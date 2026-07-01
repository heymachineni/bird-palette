#!/usr/bin/env bash
# Prepare functions/.env before deploy (shared resolver lives in functions/ in git).
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -n "${XENO_CANTO_API_KEY:-}" ]]; then
  printf 'XENO_CANTO_API_KEY=%s\n' "$XENO_CANTO_API_KEY" > functions/.env
elif [[ -f .env ]]; then
  grep -E '^XENO_CANTO_API_KEY=' .env > functions/.env 2>/dev/null || true
fi

echo "→ Prepared functions/.env for deploy"
