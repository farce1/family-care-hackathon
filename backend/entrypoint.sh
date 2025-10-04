#!/bin/bash
set -e

# Install dependencies (for development with volume mounts)
echo "Installing Python dependencies..."
pip install --no-cache-dir -r requirements.txt

echo "Running database migrations..."
alembic upgrade head

echo "Starting application..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
