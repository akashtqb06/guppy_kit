#!/bin/bash
set -e

echo "=== Guppy Kit — Dev Environment Setup ==="

# ── Python Backend ────────────────────────────────────────────────────────────
echo "→ Installing Python dependencies with uv..."
cd /workspace/backend/guppy
uv sync

# ── Run DB migrations ─────────────────────────────────────────────────────────
echo "→ Waiting for PostgreSQL..."
until pg_isready -h postgres -U guppy; do sleep 1; done
echo "→ Running migrations..."
uv run alembic upgrade head

# ── Seed MinIO bucket ─────────────────────────────────────────────────────────
echo "→ Creating MinIO bucket..."
uv run python -c "
import boto3
s3 = boto3.client('s3',
    endpoint_url='http://minio:9000',
    aws_access_key_id='guppy',
    aws_secret_access_key='guppy-secret',
)
try:
    s3.create_bucket(Bucket='guppy-dev')
    print('   Bucket created.')
except s3.exceptions.BucketAlreadyOwnedByYou:
    print('   Bucket already exists.')
"

# ── Node / pnpm ────────────────────────────────────────────────────────────────
echo "→ Installing Node dependencies..."
cd /workspace
npm install -g pnpm
pnpm install

echo ""
echo "=== Setup complete ==="
echo ""
echo "  Frontend:   http://localhost:3000   (pnpm dev --filter web)"
echo "  Backend:    http://localhost:8000   (uvicorn guppy.main:app --reload)"
echo "  API Docs:   http://localhost:8000/docs"
echo "  MinIO:      http://localhost:9001   (guppy / guppy-secret)"
echo ""
