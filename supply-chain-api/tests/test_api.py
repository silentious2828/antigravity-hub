"""Smoke tests for the API using FastAPI TestClient."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

PAYLOAD = {
    "warehouses": [
        {"id": "WH1", "name": "West", "x": 0, "y": 0, "capacity": 10000, "current_inventory": 5000},
        {"id": "WH2", "name": "Central", "x": 50, "y": 50, "capacity": 8000, "current_inventory": 4000},
    ],
    "orders": [
        {"id": "O1", "quantity": 100, "x": 10, "y": 10, "priority": 1},
        {"id": "O2", "quantity": 150, "x": 20, "y": 30, "priority": 2},
        {"id": "O3", "quantity": 200, "x": 60, "y": 70, "priority": 1},
    ],
    "connections": [
        {"id": "C1", "origin_warehouse_id": "WH1", "destination_warehouse_id": "WH2",
         "transit_days": 2, "cost_per_unit": 1.25},
    ],
}


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_optimize():
    r = client.post("/api/optimize", json=PAYLOAD)
    assert r.status_code == 200, r.text
    body = r.json()
    assert set(body["routes"]) == {"WH1", "WH2"}
    assert body["total_distance"] > 0


def test_optimize_stream():
    with client.stream("POST", "/api/optimize/stream", json=PAYLOAD) as r:
        assert r.status_code == 200
        lines = [l for l in r.iter_lines() if l]
    import json as _json
    events = [_json.loads(l)["event"] for l in lines]
    assert "complete" in events


def test_forecast():
    r = client.post("/api/forecast", json={"historical_demand": [100, 120, 110, 130], "periods": 3})
    assert r.status_code == 200
    assert len(r.json()["forecast"]) == 3


def test_eoq():
    r = client.get("/api/eoq", params={"annual_demand": 3650})
    assert r.status_code == 200
    assert r.json()["eoq"] > 0
