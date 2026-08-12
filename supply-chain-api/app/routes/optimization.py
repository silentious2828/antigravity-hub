"""Optimization endpoints."""
import json
from datetime import datetime, timezone
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from ..models import OptimizationRequest, OptimizationResponse, ForecastRequest
from ..service import SupplyChainOptimizer, DemandForecaster, InventoryOptimizer

router = APIRouter(prefix="/api", tags=["optimization"])


@router.post("/optimize", response_model=OptimizationResponse)
def optimize(req: OptimizationRequest):
    """Run full supply chain optimization: allocate orders, build routes."""
    opt = SupplyChainOptimizer()
    for w in req.warehouses:
        opt.add_warehouse(w)
    for c in req.connections:
        try:
            opt.add_connection(c)
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e))
    for o in req.orders:
        opt.add_order(o)

    result = opt.optimize()
    return OptimizationResponse(
        allocation=result["allocation"],
        routes=result["routes"],
        total_distance=result["total_distance"],
        timestamp=datetime.now(timezone.utc),
    )


@router.post("/optimize/stream")
async def optimize_stream(req: OptimizationRequest):
    """Stream optimization progress as newline-delimited JSON events."""

    async def event_stream() -> AsyncGenerator[str, None]:
        opt = SupplyChainOptimizer()
        for w in req.warehouses:
            opt.add_warehouse(w)
        for c in req.connections:
            try:
                opt.add_connection(c)
            except ValueError as e:
                yield json.dumps({"event": "error", "detail": str(e)}) + "\n"
                return
        for o in req.orders:
            opt.add_order(o)

        yield json.dumps({"event": "started", "warehouses": len(req.warehouses), "orders": len(req.orders)}) + "\n"

        for w in req.warehouses:
            yield json.dumps({"event": "allocation", "warehouse": w.id}) + "\n"

        result = opt.optimize()
        for wid, info in result["routes"].items():
            yield json.dumps({"event": "route", "warehouse": wid, "order_count": info["order_count"],
                              "distance": info["total_distance"]}) + "\n"

        yield json.dumps({"event": "complete",
                          "allocation": result["allocation"],
                          "routes": result["routes"],
                          "total_distance": result["total_distance"],
                          "timestamp": datetime.now(timezone.utc).isoformat()}) + "\n"

    return StreamingResponse(event_stream(), media_type="application/x-ndjson")


@router.post("/forecast")
def forecast(req: ForecastRequest):
    """Forecast future demand from historical observations."""
    forecaster = DemandForecaster(alpha=req.alpha)
    values = forecaster.forecast(req.historical_demand, req.periods)
    return {"historical": req.historical_demand, "forecast": values, "periods": req.periods}


@router.get("/eoq")
def eoq(annual_demand: float, holding_cost: float = 5.0, ordering_cost: float = 50.0):
    """Compute Economic Order Quantity."""
    if annual_demand < 0:
        raise HTTPException(status_code=422, detail="annual_demand cannot be negative")
    optimizer = InventoryOptimizer(holding_cost=holding_cost, ordering_cost=ordering_cost)
    return {"annual_demand": annual_demand, "eoq": optimizer.calculate_eoq(annual_demand)}
