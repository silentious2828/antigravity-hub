"""Tests for supply_chain_optimizer connection and routing features."""
import pytest

from supply_chain_optimizer import Warehouse, Order, Connection, SupplyChainOptimizer, DemandForecaster, InventoryOptimizer, RouteOptimizer


def test_connection_dataclass():
    """Test Connection dataclass can be instantiated with all fields."""
    conn = Connection(id="C1", origin_warehouse_id="WH1", destination_warehouse_id="WH2",
                      transit_days=2, cost_per_unit=1.25)
    assert conn.id == "C1"
    assert conn.origin_warehouse_id == "WH1"
    assert conn.destination_warehouse_id == "WH2"
    assert conn.transit_days == 2
    assert conn.cost_per_unit == 1.25


def test_add_connection_valid():
    """Test adding a valid connection works."""
    optimizer = SupplyChainOptimizer()
    wh1 = Warehouse(id="WH1", name="Warehouse 1", x=0, y=0, capacity=1000, current_inventory=500)
    wh2 = Warehouse(id="WH2", name="Warehouse 2", x=50, y=50, capacity=800, current_inventory=400)
    optimizer.add_warehouse(wh1)
    optimizer.add_warehouse(wh2)

    conn = Connection(id="C1", origin_warehouse_id="WH1", destination_warehouse_id="WH2",
                      transit_days=2, cost_per_unit=1.25)
    optimizer.add_connection(conn)
    assert "C1" in optimizer.connections


def test_add_connection_unknown_origin():
    """Test adding connection with unknown origin raises ValueError."""
    optimizer = SupplyChainOptimizer()
    wh1 = Warehouse(id="WH1", name="Warehouse 1", x=0, y=0, capacity=1000, current_inventory=500)
    optimizer.add_warehouse(wh1)

    conn = Connection(id="C1", origin_warehouse_id="WH2", destination_warehouse_id="WH1",
                      transit_days=2, cost_per_unit=1.25)
    try:
        optimizer.add_connection(conn)
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "Unknown origin warehouse" in str(e)


def test_add_connection_same_origin_destination():
    """Test adding connection with same origin/destination raises ValueError."""
    optimizer = SupplyChainOptimizer()
    wh1 = Warehouse(id="WH1", name="Warehouse 1", x=0, y=0, capacity=1000, current_inventory=500)
    optimizer.add_warehouse(wh1)

    conn = Connection(id="C1", origin_warehouse_id="WH1", destination_warehouse_id="WH1",
                      transit_days=2, cost_per_unit=1.25)
    try:
        optimizer.add_connection(conn)
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "must be different" in str(e)


def test_add_connection_negative_transit():
    """Test adding connection with negative transit_days raises ValueError."""
    optimizer = SupplyChainOptimizer()
    wh1 = Warehouse(id="WH1", name="Warehouse 1", x=0, y=0, capacity=1000, current_inventory=500)
    wh2 = Warehouse(id="WH2", name="Warehouse 2", x=50, y=50, capacity=800, current_inventory=400)
    optimizer.add_warehouse(wh1)
    optimizer.add_warehouse(wh2)

    conn = Connection(id="C1", origin_warehouse_id="WH1", destination_warehouse_id="WH2",
                      transit_days=-1, cost_per_unit=1.25)
    try:
        optimizer.add_connection(conn)
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "transit_days must be greater than zero" in str(e)


def test_add_connection_negative_cost():
    """Test adding connection with negative cost_per_unit raises ValueError."""
    optimizer = SupplyChainOptimizer()
    wh1 = Warehouse(id="WH1", name="Warehouse 1", x=0, y=0, capacity=1000, current_inventory=500)
    wh2 = Warehouse(id="WH2", name="Warehouse 2", x=50, y=50, capacity=800, current_inventory=400)
    optimizer.add_warehouse(wh1)
    optimizer.add_warehouse(wh2)

    conn = Connection(id="C1", origin_warehouse_id="WH1", destination_warehouse_id="WH2",
                      transit_days=2, cost_per_unit=-1.0)
    try:
        optimizer.add_connection(conn)
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "cannot be negative" in str(e)


def test_route_optimizer_has_connection():
    """Test RouteOptimizer can be initialized with connections."""
    conn = Connection(id="C1", origin_warehouse_id="WH1", destination_warehouse_id="WH2",
                      transit_days=2, cost_per_unit=1.25)
    router = RouteOptimizer(connections={"C1": conn})
    assert router.connections == {"C1": conn}


def test_route_optimize_basic():
    """Test basic route optimization works."""
    warehouse = Warehouse(id="WH1", name="Warehouse 1", x=0, y=0, capacity=1000, current_inventory=500)
    orders = [
        Order(id="O1", quantity=100, x=10, y=10, priority=1),
        Order(id="O2", quantity=150, x=20, y=20, priority=2),
    ]
    router = RouteOptimizer()
    route, total_distance = router.optimize_route(warehouse, orders)
    assert len(route) == 2
    assert total_distance > 0


def test_demand_forecaster_basic():
    """Test DemandForecaster can forecast demand."""
    forecaster = DemandForecaster(alpha=0.3)
    historical = [100, 120, 110, 130, 125, 115, 140]
    forecast = forecaster.forecast(historical, periods=3)
    assert len(forecast) == 3
    # Forecast values may be int or float depending on input
    assert all(x > 0 for x in forecast)


def test_inventory_eoq():
    """Test InventoryOptimizer EOQ calculation."""
    optimizer = InventoryOptimizer(holding_cost=5.0, ordering_cost=50.0)
    annual_demand = 10000
    eoq = optimizer.calculate_eoq(annual_demand)
    assert eoq > 0
    assert isinstance(eoq, float)


def test_optimizer_with_connections():
    """Test full optimizer with multiple connections."""
    opt = SupplyChainOptimizer()

    warehouses = [
        Warehouse('WH1', 'Warehouse 1', 0, 0, 10000, 5000),
        Warehouse('WH2', 'Warehouse 2', 50, 50, 8000, 4000),
        Warehouse('WH3', 'Warehouse 3', 100, 100, 9000, 4500),
    ]
    for wh in warehouses:
        opt.add_warehouse(wh)

    # Add connections
    opt.add_connection(Connection('C1', 'WH1', 'WH2', transit_days=2, cost_per_unit=1.25))
    opt.add_connection(Connection('C2', 'WH2', 'WH3', transit_days=3, cost_per_unit=1.50))

    orders = [
        Order('O1', 100, 5, 5, 1),
        Order('O2', 150, 55, 55, 2),
    ]
    for order in orders:
        opt.add_order(order)

    result = opt.optimize()
    assert 'allocation' in result
    assert 'routes' in result
    assert 'connections' in result
    assert 'timestamp' in result
    assert len(result['connections']) == 2