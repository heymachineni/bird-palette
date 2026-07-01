#!/usr/bin/env bash
# Copy shared modules into functions/ so Cloud Functions bundles them at deploy.
set -euo pipefail
cd "$(dirname "$0")/.."

cp shared/bird-sound-resolve.js functions/bird-sound-resolve.js
echo "→ Synced shared/bird-sound-resolve.js → functions/"
