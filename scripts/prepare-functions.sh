#!/usr/bin/env bash
# Copy shared modules into functions/ so Cloud Functions bundles them at deploy.
set -euo pipefail
cd "$(dirname "$0")/.."

cp shared/bird-sound-resolve.js functions/bird-sound-resolve.js

# Xeno-canto key lands in functions/.env (read at deploy by firebase-functions params).
if [[ -n "${XENO_CANTO_API_KEY:-}" ]]; then
  printf 'XENO_CANTO_API_KEY=%s\n' "$XENO_CANTO_API_KEY" > functions/.env
elif [[ -f .env ]]; then
  grep -E '^XENO_CANTO_API_KEY=' .env > functions/.env 2>/dev/null || true
fi

echo "→ Synced shared/bird-sound-resolve.js → functions/"
