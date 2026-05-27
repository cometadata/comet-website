#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT=1313
BIND="127.0.0.1"
URL="http://${BIND}:${PORT}/"

if pgrep -f "hugo server" >/dev/null 2>&1; then
  echo "Stopping Hugo dev server..."
  pkill -f "hugo server" || true
  sleep 1
fi

echo "Clearing generated build output..."
rm -rf public resources/_gen

echo "Running development build..."
hugo --environment development --baseURL "$URL"

echo "Rebuild complete. Start the dev server with:"
echo "  ./scripts/dev-server.sh"
