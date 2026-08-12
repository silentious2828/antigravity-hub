"""Core optimization logic, adapted from supply_chain_optimizer.py.

Kept as a thin, dependency-free layer so the API routes only handle
transport, not math. All state is created per-request (no shared global
state) so concurrent calls are safe.
"""
from __future__ import annotations

import numpy as np

from .models import Warehouse, Order, Connection, RouteInfo


class DemandForecaster:
    """Forecasts demand using exponential smoothing."""

    def __init__(self, alpha: float = 0.3):
        self.alpha = alpha

    def forecast(self, historical_data: list[float], periods: int = 7) -> list[float]:
        if not historical_data:
            return [0.0] * periods

        forecast = []
        level = historical_data[0]
        arr = np.asarray(historical_data, dtype=float)

        for _ in range(periods):
            forecast.append(level)
            avg_demand = float(np.mean(arr[-7:]))
            level = self.alpha * avg_demand + (1 - self.alpha) * level

        return forecast


class InventoryOptimizer:
    """Optimizes inventory levels using Economic Order Quantity (EOQ)."""

    def __init__(self, holding_cost: float = 5.0, ordering_cost: float = 50.0):
        self.holding_cost = holding_cost
        self.ordering_cost = ordering_cost

    def calculate_eoq(self, annual_demand: float) -> float:
        if annual_demand == 0:
            return 0.0
        return float(np.sqrt((2 * annual_demand * self.ordering_cost) / self.holding_cost))

    def calculate_reorder_point(self, daily_demand: float, lead_time_days: int) -> float:
        return daily_demand * lead_time_days


class RouteOptimizer:
    """Optimizes delivery routes using a nearest-neighbor heuristic."""

    @staticmethod
    def distance(x1: float, y1: float, x2: float, y2: float) -> float:
        return float(np.hypot(x2 - x1, y2 - y1))

    def optimize_route(self, warehouse: Warehouse, orders: list[Order]) -> tuple[list[Order], float]:
        if not orders:
            return [], 0.0

        unvisited = list(orders)
        route: list[Order] = []
        cx, cy = warehouse.x, warehouse.y
        total = 0.0

        while unvisited:
            nearest = min(unvisited, key=lambda o: self.distance(cx, cy, o.x, o.y))
            total += self.distance(cx, cy, nearest.x, nearest.y)
            route.append(nearest)
            cx, cy = nearest.x, nearest.y
            unvisited.remove(nearest)

        total += self.distance(cx, cy, warehouse.x, warehouse.y)
        return route, total


class SupplyChainOptimizer:
    """Main orchestrator for supply chain optimization."""

    def __init__(self):
        self.warehouses: list[Warehouse] = []
        self.orders: list[Order] = []
        self.connections: dict[str, Connection] = {}
        self.forecaster = DemandForecaster()
        self.inventory_optimizer = InventoryOptimizer()
        self.route_optimizer = RouteOptimizer()

    def add_warehouse(self, warehouse: Warehouse) -> None:
        self.warehouses.append(warehouse)

    def add_order(self, order: Order) -> None:
        self.orders.append(order)

    def add_connection(self, connection: Connection) -> None:
        ids = {w.id for w in self.warehouses}
        if connection.origin_warehouse_id not in ids:
            raise ValueError(f"Unknown origin warehouse: {connection.origin_warehouse_id}")
        if connection.destination_warehouse_id not in ids:
            raise ValueError(f"Unknown destination warehouse: {connection.destination_warehouse_id}")
        if connection.origin_warehouse_id == connection.destination_warehouse_id:
            raise ValueError("Connection origin and destination must be different warehouses")
        self.connections[connection.id] = connection

    def allocate_orders(self) -> dict[str, list[Order]]:
        allocation = {w.id: [] for w in self.warehouses}
        for order in self.orders:
            nearest = min(self.warehouses, key=lambda w: self.route_optimizer.distance(w.x, w.y, order.x, order.y))
            allocation[nearest.id].append(order)
        return allocation

    def optimize(self) -> dict:
        allocation = self.allocate_orders()
        routes: dict[str, dict] = {}
        total_distance = 0.0

        for warehouse in self.warehouses:
            orders_for_warehouse = allocation[warehouse.id]
            if orders_for_warehouse:
                route, distance = self.route_optimizer.optimize_route(warehouse, orders_for_warehouse)
                routes[warehouse.id] = {
                    "order_ids": [o.id for o in route],
                    "total_distance": distance,
                    "order_count": len(route),
                }
                total_distance += distance

        return {
            "allocation": {k: [o.id for o in v] for k, v in allocation.items()},
            "routes": routes,
            "total_distance": total_distance,
            "connections": self.connections,
        }
