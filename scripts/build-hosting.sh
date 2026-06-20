#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

node scripts/prepare-static-export.mjs hide
trap 'node scripts/prepare-static-export.mjs restore' EXIT

STATIC_EXPORT=true USE_JSON_DATA=true npx next build
