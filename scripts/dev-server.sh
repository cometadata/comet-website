#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT=1313
BIND="127.0.0.1"
URL="http://${BIND}:${PORT}/"

if pgrep -f "hugo server" >/dev/null 2>&1; then
  echo "Hugo dev server is already running:"
  pgrep -fl "hugo server" || true
  echo "Stop it first: pkill -f \"hugo server\""
  exit 1
fi

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port $PORT is already in use:"
  lsof -nP -iTCP:"$PORT" -sTCP:LISTEN || true
  exit 1
fi

echo "Running initial development build (compiles Sass to public/css/style.css)..."
hugo --environment development --baseURL "$URL"

echo "Starting Hugo dev server at $URL"
exec hugo server -D \
  --port "$PORT" \
  --bind "$BIND" \
  --baseURL "$URL" \
  --disableFastRender \
  --environment development
