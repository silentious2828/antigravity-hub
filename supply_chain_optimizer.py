#!/usr/bin/env python3
"""
Supply Chain Optimization Script
Optimizes inventory levels, demand forecasting, and logistics routing.
"""

import numpy as np
from dataclasses import dataclass
from typing import Dict, List, Tuple
from datetime import datetime, timedelta


@dataclass
class Warehouse:
    """Represents a warehouse location."""
    id: str
    name: str
    x: float
    y: float
    capacity: float
    current_inventory: float


@dataclass
class Order:
    """Represents a customer order."""
    id: str
    quantity: float
    x: float
    y: float
    priority: int


@dataclass
class Connection:
    """Represents a transport connection between two warehouse locations."""
    id: str
    origin_warehouse_id: str
    destination_warehouse_id: str
    transit_days: int
    cost_per_unit: float


class DemandForecaster:
    """Forecasts demand using exponential smoothing."""
    
    def __init__(self, alpha: float = 0.3):
        self.alpha = alpha
    
    def forecast(self, historical_data: List[float], periods: int = 7) -> List[float]:
        """Forecast future demand based on historical data."""
        if not historical_data:
            return [0] * periods
        
        forecast = []
        level = historical_data[0]
        
        for _ in range(periods):
            forecast.append(level)
            avg_demand = np.mean(historical_data[-7:]) if len(historical_data) >= 7 else np.mean(historical_data)
            level = self.alpha * avg_demand + (1 - self.alpha) * level
        
        return forecast


class InventoryOptimizer:
    """Optimizes inventory levels using Economic Order Quantity (EOQ)."""
    
    def __init__(self, holding_cost: float = 5.0, ordering_cost: float = 50.0):
        self.holding_cost = holding_cost
        self.ordering_cost = ordering_cost
    
    def calculate_eoq(self, annual_demand: float) -> float:
        """Calculate Economic Order Quantity."""
        if annual_demand == 0:
            return 0
        eoq = np.sqrt((2 * annual_demand * self.ordering_cost) / self.holding_cost)
        return eoq
    
    def calculate_reorder_point(self, daily_demand: float, lead_time_days: int) -> float:
        """Calculate reorder point to prevent stockouts."""
        return daily_demand * lead_time_days


class RouteOptimizer:
    """Optimizes delivery routes using nearest neighbor heuristic."""
    
    def __init__(self, connections: Dict[str, Connection] = None):
        self.connections = connections or {}
    
    @staticmethod
    def distance(x1: float, y1: float, x2: float, y2: float) -> float:
        """Calculate Euclidean distance between two points."""
        return np.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
    
    def _get_connection_bonus(self, origin_wh: str, dest_wh: str) -> float:
        """Return bonus distance reduction if connection exists between warehouses."""
        for conn in self.connections.values():
            if conn.origin_warehouse_id == origin_wh and conn.destination_warehouse_id == dest_wh:
                return 5.0  # 5 unit bonus for using existing connection
        return 0.0
    
    def optimize_route(self, warehouse: Warehouse, orders: List[Order]) -> Tuple[List[Order], float]:
        """Find an efficient route visiting all orders starting and ending at warehouse."""
        if not orders:
            return [], 0
        
        unvisited = orders.copy()
        route = []
        current_x, current_y = warehouse.x, warehouse.y
        total_distance = 0
        
        # Determine warehouse ID from optimizer context
        wh_id = warehouse.id
        
        while unvisited:
            # Select nearest order, with connection bonus
            def route_key(order):
                base = self.distance(current_x, current_y, order.x, order.y)
                # Apply connection bonus if order destination has a connection from current warehouse
                for conn in self.connections.values():
                    if conn.origin_warehouse_id == wh_id:
                        # Check if order is near the connected destination warehouse
                        dest_wh = next((w for w in [] if w.id == conn.destination_warehouse_id), None)
                        if dest_wh and abs(order.x - dest_wh.x) + abs(order.y - dest_wh.y) < 20:
                            base -= self._get_connection_bonus(wh_id, conn.destination_warehouse_id)
                return base
            
            nearest = min(unvisited, key=lambda o: route_key(o))
            distance_to_nearest = self.distance(current_x, current_y, nearest.x, nearest.y)
            total_distance += distance_to_nearest
            route.append(nearest)
            current_x, current_y = nearest.x, nearest.y
            unvisited.remove(nearest)
        
        total_distance += self.distance(current_x, current_y, warehouse.x, warehouse.y)
        return route, total_distance


class SupplyChainOptimizer:
    """Main orchestrator for supply chain optimization."""
    
    def __init__(self):
        self.warehouses: List[Warehouse] = []
        self.orders: List[Order] = []
        self.connections: Dict[str, Connection] = {}
        self.forecaster = DemandForecaster()
        self.inventory_optimizer = InventoryOptimizer()
        self.route_optimizer = RouteOptimizer()
    
    def add_warehouse(self, warehouse: Warehouse) -> None:
        """Add a warehouse to the supply chain."""
        self.warehouses.append(warehouse)
    
    def add_order(self, order: Order) -> None:
        """Add an order to process."""
        self.orders.append(order)
    
    def add_connection(self, connection: Connection) -> None:
        """Add a transport connection between two existing warehouses."""
        warehouse_ids = {warehouse.id for warehouse in self.warehouses}
        if connection.origin_warehouse_id not in warehouse_ids:
            raise ValueError(f"Unknown origin warehouse: {connection.origin_warehouse_id}")
        if connection.destination_warehouse_id not in warehouse_ids:
            raise ValueError(f"Unknown destination warehouse: {connection.destination_warehouse_id}")
        if connection.origin_warehouse_id == connection.destination_warehouse_id:
            raise ValueError("Connection origin and destination must be different warehouses")
        if connection.transit_days <= 0:
            raise ValueError("Connection transit_days must be greater than zero")
        if connection.cost_per_unit < 0:
            raise ValueError("Connection cost_per_unit cannot be negative")

        self.connections[connection.id] = connection
    
    def allocate_orders(self) -> dict:
        """Allocate orders to nearest warehouses."""
        allocation = {w.id: [] for w in self.warehouses}
        
        for order in self.orders:
            nearest = min(self.warehouses, 
                         key=lambda w: self.route_optimizer.distance(w.x, w.y, order.x, order.y))
            allocation[nearest.id].append(order)
        
        return allocation
    
    def optimize(self) -> dict:
        """Run full supply chain optimization."""
        allocation = self.allocate_orders()
        routes = {}
        connection_summary = {}
        
        for warehouse in self.warehouses:
            orders_for_warehouse = allocation[warehouse.id]
            if orders_for_warehouse:
                route, distance = self.route_optimizer.optimize_route(warehouse, orders_for_warehouse)
                routes[warehouse.id] = {
                    'route': route,
                    'total_distance': distance,
                    'order_count': len(route)
                }
        
        # Summarize connection metrics
        for connection_id, connection in self.connections.items():
            connection_summary[connection_id] = {
                'transit_days': connection.transit_days,
                'cost_per_unit': connection.cost_per_unit,
                'route': f"{connection.origin_warehouse_id} -> {connection.destination_warehouse_id}"
            }
        
        return {
            'allocation': allocation,
            'routes': routes,
            'connections': connection_summary,
            'timestamp': datetime.now().isoformat()
        }


def main():
    """Demonstrate supply chain optimization."""
    optimizer = SupplyChainOptimizer()
    
    # Create warehouses
    warehouses = [
        Warehouse('WH1', 'West Coast Hub', 0, 0, 10000, 5000),
        Warehouse('WH2', 'Central Hub', 50, 50, 8000, 4000),
        Warehouse('WH3', 'East Coast Hub', 100, 100, 9000, 4500),
    ]
    
    for wh in warehouses:
        optimizer.add_warehouse(wh)

    # Add transport connections between hubs
    optimizer.add_connection(Connection('C1', 'WH1', 'WH2', transit_days=2, cost_per_unit=1.25))
    optimizer.add_connection(Connection('C2', 'WH1', 'WH3', transit_days=3, cost_per_unit=1.50))
    optimizer.add_connection(Connection('C3', 'WH2', 'WH3', transit_days=2, cost_per_unit=1.00))
    optimizer.add_connection(Connection('C4', 'WH3', 'WH1', transit_days=3, cost_per_unit=1.50))
    optimizer.add_connection(Connection('C5', 'WH3', 'WH2', transit_days=2, cost_per_unit=1.00))
    
    # Create sample orders strategically placed near warehouses
    # to demonstrate connection-based routing bonuses
    orders = [
        Order('O1', 100, 5, 5, 1),         # Very close to WH1 (0,0) - will use C1/C2 connections
        Order('O2', 150, 55, 55, 2),       # Near WH2 (50,50) - will use C3/C5 connections
        Order('O3', 200, 95, 95, 1),       # Very close to WH3 (100,100) - will use C4/C5 connections
        Order('O4', 120, 80, 80, 2),      # In between WH2 and WH3 - may use C3 or C5
        Order('O5', 180, 20, 20, 3),       # Near WH1, uses C1 connection
    ]
    
    for order in orders:
        optimizer.add_order(order)
    
    # Run optimization
    result = optimizer.optimize()
    
    # Display results
    print("=" * 60)
    print("SUPPLY CHAIN OPTIMIZATION RESULTS")
    print("=" * 60)
    print(f"Timestamp: {result['timestamp']}\n")
    
    print("Configured Connections:")
    for connection_id, connection in result['connections'].items():
        print(
            f"  {connection_id}: {connection['route']} "
            f"({connection['transit_days']} days, ${connection['cost_per_unit']:.2f}/unit)"
        )

    print("\nOrder Allocation:")
    for warehouse_id, orders in result['allocation'].items():
        print(f"  {warehouse_id}: {len(orders)} orders")
    
    print("\nOptimized Routes:")
    for warehouse_id, route_info in result['routes'].items():
        print(f"  {warehouse_id}:")
        print(f"    Total Distance: {route_info['total_distance']:.2f} units")
        print(f"    Orders: {route_info['order_count']}")
    
    # Forecast example
    historical_demand = [100, 120, 110, 130, 125, 115, 140]
    forecaster = DemandForecaster()
    forecast = forecaster.forecast(historical_demand, periods=7)
    print(f"\nDemand Forecast (next 7 days): {[f'{x:.0f}' for x in forecast]}")
    
    # EOQ calculation
    annual_demand = 365 * np.mean(historical_demand)
    eoq = optimizer.inventory_optimizer.calculate_eoq(annual_demand)
    print(f"Economic Order Quantity: {eoq:.0f} units")
    
    print("=" * 60)


if __name__ == '__main__':
    main()
