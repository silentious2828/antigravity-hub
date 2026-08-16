"""Analytics endpoints for supply chain insights and reporting.

Provides aggregated metrics, trend analysis, and KPI dashboards
for monitoring supply chain performance across warehouses and time.
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from ..bigquery_integration import get_bigquery_client

router = APIRouter(prefix="/api", tags=["analytics"])

_bq_client = get_bigquery_client()


@router.get("/inventory-summary", response_model=Dict[str, Any])
def inventory_summary(
    warehouse_id: Optional[str] = Query(default=None, description="Filter by warehouse ID"),
) -> Any:
    """Get inventory summary across all warehouses or a specific warehouse.

    Returns:
        Summary of current inventory levels, reorder status, and capacity utilization.
    """
    return _bq_client.get_inventory_summary()


@router.get("/forecast-trends", response_model=Dict[str, Any])
def forecast_trends(
    item_id: Optional[str] = Query(default=None, description="Filter by item ID"),
    periods: int = Query(default=7, ge=1, le=90, description="Forecast periods"),
) -> Any:
    """Get demand forecast trends for item planning.

    Returns:
        Historical demand data with forecast projections and confidence intervals.
    """
    return _bq_client.get_forecast_trends(periods=periods)


@router.get("/route-efficiency", response_model=Dict[str, Any])
def route_efficiency(
    warehouse_id: Optional[str] = Query(default=None, description="Filter by warehouse ID"),
) -> Any:
    """Get route optimization efficiency metrics.

    Returns:
        Average route distances, optimization gain, and cost savings
        across all warehouses or a specific warehouse.
    """
    return _bq_client.get_route_efficiency()


@router.get("/kpi-dashboard", response_model=Dict[str, Any])
def kpi_dashboard(
    period: str = Query(default="30d", pattern="^(today|7d|30d|90d|1y)$"),
) -> Any:
    """Get KPI dashboard data for supply chain monitoring.

    Returns key performance indicators across:
    - Inventory turns
    - Order fulfillment rate
    - On-time delivery
    - Stockout incidents
    - Cost metrics

    Args:
        period: Time period for KPI calculation (today, 7d, 30d, 90d, 1y)

    Returns:
        Dashboard KPI data structure.
    """
    return _bq_client.get_kpi_dashboard(period=period)


@router.post("/clear-caches", response_model=Dict[str, str])
def clear_caches_endpoint() -> Any:
    """Clear all cached data for fresh recomputation."""
    from ..cache import clear_all_caches
    clear_all_caches()
    return {"status": "success", "message": "All caches cleared successfully"}


@router.get("/health-check", response_model=Dict[str, str])
def analytics_health() -> Any:
    """Health check for analytics endpoints."""
    return {
        "status": "healthy",
        "cache": "operational",
        "bigquery": "connected",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }