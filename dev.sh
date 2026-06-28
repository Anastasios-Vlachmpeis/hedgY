#!/usr/bin/env bash
# One command to run the whole stack.
#
#   FastAPI cross-venue aggregator  -> http://127.0.0.1:8000  (/markets /health /docs)
#   Node SSE price stream           -> http://127.0.0.1:3001  (/api/stream)
#   Vite React app                  -> http://localhost:5173
#
# Usage:  bash dev.sh        (or  npm run dev  from the repo root)
# Ctrl-C stops all three.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Prefer Python 3.10+ (backend uses PEP 604 union syntax).
PYTHON=""
for candidate in python3.12 python3.11 python3.10 python3; do
  if command -v "$candidate" >/dev/null 2>&1; then
    ver=$("$candidate" -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
    major=${ver%%.*}
    minor=${ver#*.}
    if [ "$major" -gt 3 ] || { [ "$major" -eq 3 ] && [ "$minor" -ge 10 ]; }; then
      PYTHON="$candidate"
      break
    fi
  fi
done
if [ -z "$PYTHON" ]; then
  echo "▶ need Python 3.10+ for the FastAPI backend"
  exit 1
fi

# ---- backend deps (first run only) ----
venv_ok() {
  [ -x "$ROOT/.venv/bin/uvicorn" ] && "$ROOT/.venv/bin/python" -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)' 2>/dev/null
}
if ! venv_ok; then
  echo "▶ creating Python venv + installing backend deps…"
  rm -rf "$ROOT/.venv"
  "$PYTHON" -m venv "$ROOT/.venv"
  "$ROOT/.venv/bin/python" -m pip install -q --upgrade pip
  "$ROOT/.venv/bin/pip" install -q -r "$ROOT/requirements.txt"
fi

# ---- node deps (first run only) ----
if [ ! -d "$ROOT/node_modules" ]; then
  echo "▶ installing node deps…"
  ( cd "$ROOT" && npm install )
fi

# ---- run all, tear down together ----
cleanup() { kill 0 2>/dev/null || true; }
trap cleanup EXIT INT TERM

echo "▶ backend   http://127.0.0.1:8000   (interactive docs at /docs)"
"$ROOT/.venv/bin/uvicorn" app.main:app --host 127.0.0.1 --port 8000 --reload &

echo "▶ stream    http://127.0.0.1:3001   (/api/stream)"
if [ -f "$ROOT/.env" ]; then
  node --env-file="$ROOT/.env" "$ROOT/server/sse.mjs" &
else
  node "$ROOT/server/sse.mjs" &
fi

echo "▶ frontend  http://localhost:5173"
( cd "$ROOT" && npx vite ) &

wait
