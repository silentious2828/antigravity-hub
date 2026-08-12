#!/bin/bash
# One-click launcher for OmniRoute hub: server, dashboard, and shim harness.
set -euo pipefail

mkdir -p logs

echo "🚀 Installing runtime dependencies..."
python3 -m pip install fastapi uvicorn streamlit plotly websockets 2>&1 | tail -5 >/dev/null || true

echo "🧹 Cleaning stale processes..."
pkill -f "uvicorn server:app" || true
pkill -f "streamlit run dashboard.py" || true
pkill -f "test_triage_shim.py" || true

echo "🚀 Starting FastAPI WebSocket server..."
nohup python3 server.py > logs/server.log 2>&1 &
echo $! > logs/server.pid

echo "📊 Starting Streamlit dashboard..."
nohup streamlit run dashboard.py > logs/dashboard.log 2>&1 &
echo $! > logs/dashboard.pid

sleep 4

echo "🧪 Running triage shim harness..."
python3 test_triage_shim.py || true

echo ""
echo "✅ OmniRoute hub is up."
echo "   Server : http://127.0.0.1:20128"
echo "   Dashboard: streamlit run dashboard.py"
echo "   Logs   : logs/server.log, logs/dashboard.log"
