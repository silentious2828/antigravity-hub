# Supply Chain API Guide

## Overview
A public FastAPI service wrapping supply-chain optimization logic: demand forecasting,
inventory (EOQ), and delivery route optimization.

## Quick Start

```bash
# 1. Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install fastapi "uvicorn[standard]" numpy pytest httpx

# 2b. Or use the pre-configured venv
cd my-project/supply-chain-api
.venv/bin/pip install -e .  # if set up with pyproject.toml

# 3. Start the server
./run.sh      # or: .venv/bin/uvicorn app.main:app --reload

# 4. Open the API documentation
#   - Swagger UI:      http://localhost:8111/docs
#   - ReDoc:           http://localhost:8111/redoc
#   - Frontend:        http://localhost:8111/
```

## API Endpoints

### `GET /`
Serves the single-page frontend (SVG route visualization).

### `GET /health`
Liveness check for uptime monitors.

**Response:**
```json
{
  "status": "ok",
  "service": "supply-chain-api",
  "version": "0.1.0"
}
```

### `POST /api/optimize`
Run full supply chain optimization: allocate orders, build routes.

**Request Body (JSON):**
```json
{
  "warehouses": [
    {"id": "WH1", "name": "Warehouse 1", "x": 0, "y": 0, "capacity": 10000, "current_inventory": 5000}
  ],
  "orders": [
    {"id": "O1", "quantity": 100, "x": 5, "y": 5, "priority": 1}
  ],
  "connections": [
    {"id": "C1", "origin_warehouse_id": "WH1", "destination_warehouse_id": "WH2", "transit_days": 2, "cost_per_unit": 1.25}
  ]
}
```

**Response:**
```json
{
  "allocation": {"WH1": ["O1"]},
  "routes": {"WH1": {"order_ids": ["O1"], "total_distance": 14.14, "order_count": 1}},
  "total_distance": 14.14,
  "timestamp": "2026-08-12T19:47:42.332792"
}
```

### `POST /api/optimize/stream`
Streaming (NDJSON) version of optimize. Returns events as they happen:
- `started`: Optimization began with N warehouses and M orders
- `allocation`: Warehouse X received Y orders
- `route`: Warehouse X route completed, Z orders, D distance
- `complete`: Full optimization result

### `POST /api/forecast`
Exponential-smoothing demand forecast.

**Request Body (JSON):**
```json
{
  "historical_demand": [100, 120, 110, 130, 125, 115, 140],
  "periods": 7,
  "alpha": 0.3
}
```

**Response:**
```json
{
  "historical": [100, 120, 110, 130, 125, 115, 140],
  "forecast": [104.1, 108.5, 112.3, 116.7, 120.9, 125.1, 129.3],
  "periods": 7
}
```

### `GET /api/eoq`
Economic Order Quantity calculation.

**Query Parameters:**
- `annual_demand` (required): Annual demand volume
- `holding_cost` (optional): Holding cost per unit per year (default: 5.0)
- `ordering_cost` (optional): Ordering cost per order (default: 50.0)

**Response:**
```json
{
  "annual_demand": 10000,
  "eoq": 447.21
}
```

## Frontend

The frontend at `/` serves an interactive SVG route visualization:

**Features:**
- Drag JSON network data into the textarea
- "Run Optimization" button calls `/api/optimize` live
- "Load Demo Network" pre-fills with sample warehouses, orders, and connections
- Visualizes routes with color-coded paths:
  - Blue circles: Warehouses (with ID labels)
- Orange circles: Orders (with ID labels)
- Purple paths: Optimized routes
- Stats panel: Warehouse count, Order count, Total distance
- Real-time logging of API responses

**Demo Network** includes:
- 3 warehouses (WH1, WH2, WH3) at coordinates (20,120), (400,200), (720,420)
- 6 orders at various locations
- 2 connections (C1: WH1→WH2, C2: WH2→WH3)
- Automatic route drawing on "Run Optimization"

## Testing

```bash
# Run the test suite
.venv/bin/python -m pytest

# Expected output:
5 passed, 1 warning in 0.14s
```

Test coverage:
- `test_health`: Liveness check
- `test_optimize`: Full optimization endpoint
- `test_optimize_stream`: Streaming optimization
- `test_forecast`: Demand forecasting
- `test_eoq`: Economic Order Quantity

## Deployment

### Production Configuration
```bash
# Production start (no reload, all interfaces)
./run.sh  # without --dev flag

# Or manually:
.venv/bin/uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8111 \
  --workers 4
```

### Environment Variables
The API doesn't require environment variables for basic operation,
but you may want to set:
- `STRIPE_SECRET_KEY` - If integrating with Stripe payments
- `ANTHROPIC_API_KEY` - For AI provider routing
- etc.

## API Specifications

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Single-page frontend (SVG route visualization) |
| GET | `/health` | Liveness check for uptime monitors |
| POST | `/api/optimize` | Full optimization (warehouses + orders + connections) |
| POST | `/api/optimize/stream` | Streaming NDJSON version of optimize |
| POST | `/api/forecast` | Exponential-smoothing demand forecast |
| GET | `/api/eoq` | Economic Order Quantity |

**Base URL:** `http://localhost:8111` (development) or your production domain

## Error Handling

All endpoints return appropriate HTTP errors:
- `400`: Bad request (validation failure, negative demand, etc.)
- `422`: Unprocessable entity (Pydantic validation errors)
- `500`: Internal server error (unexpected errors)

Error responses follow:
```json
{"detail": "Error description"}
```

## Integration Examples

### Python Client
```python
import httpx

client = httpx.Client(base_url="http://localhost:8111")

# Optimize
response = client.post("/api/optimize", json={
    "warehouses": [{"id": "WH1", "x": 0, "y": 0, "capacity": 10000, "current_inventory": 5000}],
    "orders": [{"id": "O1", "quantity": 100, "x": 5, "y": 5, "priority": 1}],
    "connections": [{"id": "C1", "origin_warehouse_id": "WH1", "destination_warehouse_id": "WH2", "transit_days": 2, "cost_per_unit": 1.25}]
})
result = response.json()

# Forecast
response = client.post("/api/forecast", json={
    "historical_demand": [100, 120, 110, 130, 125, 115, 140],
    "periods": 7,
    "alpha": 0.3
})
result = response.json()

# EOQ
response = client.get("/api/eoq?annual_demand=10000")
result = response.json()
```

### JavaScript/Browser (Frontend)
The frontend automatically calls the API when "Run Optimization" is clicked.
No JavaScript needed - all API interactions happen through the frontend.

## API Evolution

### Adding New Endpoints
1. Add route in `app/routes/` (e.g., `new_endpoint.py`)
2. Add function in `app/service.py` (if needed)
3. Include router in `app/main.py`: `app.include_router(new_router)`
4. Update README with new endpoint documentation
5. Add tests in `tests/test_api.py`

### Versioning
Current version: `0.1.0`
Consider adding version path prefix (`/v1/`) for future major changes.

## Deployment Checklist

- [ ] Install dependencies: `pip install fastapi "uvicorn[standard]" numpy pytest httpx`
- [ ] Start server: `./run.sh`
- [ ] Verify `/health` returns `{"status":"ok",...}`
- [ ] Test `/` serves the frontend
- [ ] Test `/api/optimize` with demo data
- [ ] Test `/api/forecast` with sample data
- [ ] Test `/api/eoq?annual_demand=10000`
- [ ] Run test suite: `5 passed`
- [ ] Set up domain/SSL for production
- [ ] Configure CORS for your frontend domain
- [ ] Add monitoring/health checks
EOF
echo "Supply chain API guide created"