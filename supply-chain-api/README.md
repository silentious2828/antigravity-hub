# Supply Chain AI API

FastAPI service wrapping supply-chain optimization logic: demand forecasting,
inventory (EOQ), and delivery route optimization.

## Quick start

```bash
python3 -m venv .venv
.venv/bin/pip install fastapi "uvicorn[standard]" numpy pytest httpx
./run.sh                  # or: .venv/bin/uvicorn app.main:app --reload
# Open http://localhost:8111/docs for the interactive API UI
```

A single-page browser frontend is served at `/` — load the demo network, hit
"Run Optimization", and see routes drawn on an SVG map. It calls the API live.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/` | Single-page frontend (SVG route visualization) |
| GET  | `/health` | Liveness check for uptime monitors |
| POST | `/api/optimize` | Allocate orders to warehouses, build routes, total distance |
| POST | `/api/optimize/stream` | Streaming (NDJSON) version of optimize |
| POST | `/api/forecast` | Exponential-smoothing demand forecast |
| GET  | `/api/eoq` | Economic Order Quantity for an annual demand |

## Test

```bash
.venv/bin/python -m pytest
```

## Layout

```
app/
  main.py           # FastAPI entrypoint, CORS, /health
  models.py         # Pydantic v2 request/response schemas
  service.py        # core optimization logic (per-request, stateless)
  routes/
    optimization.py # the API endpoints
tests/
  test_api.py       # smoke tests
```
