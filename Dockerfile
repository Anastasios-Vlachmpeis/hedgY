# Backend container: FastAPI aggregator + paper-trading ledger.
# Runs as a single always-on process (the in-memory market store + background
# refresh poller need this — they do NOT work on serverless/Vercel).
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /srv

# Install deps first for better layer caching.
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# App code (web/, .venv, .git, *.db, node_modules are excluded via .dockerignore).
COPY . .

# Hosts (Railway/Render/Fly) inject $PORT; default to 8000 for local `docker run`.
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
