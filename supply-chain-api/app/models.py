"""Pydantic request/response schemas for the API."""
from typing import List, Optional, Dict
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class Warehouse(BaseModel):
    """A warehouse location."""
    model_config = ConfigDict(extra="forbid")

    id: str = Field(description="Unique warehouse identifier")
    name: str = Field(description="Human-readable name")
    x: float = Field(description="X coordinate (e.g. longitude)")
    y: float = Field(description="Y coordinate (e.g. latitude)")
    capacity: float = Field(gt=0, description="Max storage capacity")
    current_inventory: float = Field(ge=0, description="Units currently in stock")


class Order(BaseModel):
    """A customer order to be fulfilled."""
    model_config = ConfigDict(extra="forbid")

    id: str = Field(description="Unique order identifier")
    quantity: float = Field(gt=0, description="Units requested")
    x: float = Field(description="Delivery X coordinate")
    y: float = Field(description="Delivery Y coordinate")
    priority: int = Field(ge=1, le=5, default=3, description="1 (highest) to 5 (lowest)")


class Connection(BaseModel):
    """A transport connection between two warehouses."""
    model_config = ConfigDict(extra="forbid")

    id: str = Field(description="Unique connection identifier")
    origin_warehouse_id: str = Field(description="Source warehouse")
    destination_warehouse_id: str = Field(description="Destination warehouse")
    transit_days: int = Field(gt=0, description="Days in transit")
    cost_per_unit: float = Field(ge=0, description="Cost to ship one unit")


class ForecastRequest(BaseModel):
    """Input for demand forecasting."""
    model_config = ConfigDict(extra="forbid")

    historical_demand: List[float] = Field(min_length=1, description="Past demand observations")
    periods: int = Field(ge=1, le=60, default=7, description="Number of periods to forecast")
    alpha: float = Field(ge=0.0, le=1.0, default=0.3, description="Smoothing factor")


class OptimizationRequest(BaseModel):
    """Input for full supply chain optimization."""
    model_config = ConfigDict(extra="forbid")

    warehouses: List[Warehouse] = Field(min_length=1)
    orders: List[Order] = Field(default_factory=list)
    connections: List[Connection] = Field(default_factory=list)


class RouteInfo(BaseModel):
    """An optimized route for one warehouse."""
    order_ids: List[str]
    total_distance: float
    order_count: int


class OptimizationResponse(BaseModel):
    """Result of a full optimization run."""
    allocation: Dict[str, List[str]]
    routes: Dict[str, RouteInfo]
    total_distance: float
    timestamp: datetime
