#!/bin/bash
# Start the Supply Chain AI API server
# Usage: ./run.sh [--dev]
set -e
cd "$(dirname "$0")"

if [ "$1" = "--dev" ]; then
    exec .venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8111
else
    exec .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8111
fi
