#!/usr/bin/env bash
# Retry firebase deploy on transient API failures (common in CI).
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: firebase-deploy-with-retry.sh <firebase deploy args...>" >&2
  exit 1
fi

ATTEMPTS="${FIREBASE_DEPLOY_ATTEMPTS:-3}"
PAUSE_SEC="${FIREBASE_DEPLOY_RETRY_PAUSE_SEC:-20}"

for ((attempt = 1; attempt <= ATTEMPTS; attempt++)); do
  echo "→ firebase deploy attempt ${attempt}/${ATTEMPTS}"
  if npx firebase deploy "$@" --project birdpalette --non-interactive; then
    echo "✓ deploy succeeded on attempt ${attempt}"
    exit 0
  fi
  if [[ "${attempt}" -lt "${ATTEMPTS}" ]]; then
    echo "⚠ deploy failed; retrying in ${PAUSE_SEC}s..."
    sleep "${PAUSE_SEC}"
  fi
done

echo "✗ deploy failed after ${ATTEMPTS} attempts" >&2
exit 1
