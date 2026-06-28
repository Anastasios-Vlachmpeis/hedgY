#!/usr/bin/env bash
# One command to run the whole stack.
#
#   FastAPI cross-venue aggregator  -> http://127.0.0.1:8000  (/markets /suggestions /health /docs)
#   Next.js web app                 -> http://localhost:3000  (/  /markets  /dashboard  /structure)
#
# Usage:  bash dev.sh        (or  npm run dev  from the repo root)
# Ctrl-C stops both.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ---- backend deps (first run only) ----
PYTHON=""
for candidate in python3.12 python3.11 python3.10 python3; do
  if command -v "$candidate" >/dev/null 2>&1; then
    PYTHON="$(command -v "$candidate")"
    break
  fi
done
if [ ! -x "$ROOT/.venv/bin/uvicorn" ]; then
  echo "▶ creating Python venv + installing backend deps…"
  "$PYTHON" -m venv "$ROOT/.venv"
  "$ROOT/.venv/bin/python" -m pip install -q --upgrade pip
  "$ROOT/.venv/bin/pip" install -q -r "$ROOT/requirements.txt"
fi

# ---- web deps (first run only) ----
if [ ! -d "$ROOT/web/node_modules" ]; then
  echo "▶ installing web deps…"
  ( cd "$ROOT/web" && npm install )
fi

# ---- run both, tear down together ----
cleanup() { kill 0 2>/dev/null || true; }
trap cleanup EXIT INT TERM

echo "▶ backend   http://127.0.0.1:8000   (interactive docs at /docs)"
"$ROOT/.venv/bin/uvicorn" app.main:app --host 127.0.0.1 --port 8000 --reload &

echo "▶ frontend  http://localhost:3000"
( cd "$ROOT/web" && npm run dev ) &

wait
