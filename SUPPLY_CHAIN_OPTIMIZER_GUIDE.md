# Supply Chain Optimizer Guide

## Overview
A Python script for supply chain optimization with warehouse connections,
connection-aware routing, demand forecasting, and inventory optimization.

## Installation
```bash
# Using PYTHONPATH (development)
export PYTHONPATH=/path/to/my-project:$PYTHONPATH

# Or install in development mode
cd my-project
pip install -e .

# Install numpy dependency (required)
pip install numpy
```

## Quick Start
```bash
# Basic optimization with default settings
data-agent optimize \
  --warehouses '[{"id":"WH1","x":0,"y":0,"capacity":10000,"current_inventory":5000},
                 {"id":"WH2","x":50,"y":50,"capacity":8000,"current_inventory":4000},
                 {"id":"WH3","x":100,"y":100,"capacity":9000,"current_inventory":4500}]' \
  --connections '[{"id":"C1","origin_warehouse_id":"WH1","destination_warehouse_id":"WH2","transit_days":2,"cost_per_unit":1.25}]' \
  --orders '[{"id":"O1","quantity":100,"x":5,"y":5,"priority":1}]'

# Full demo with all 5 connections and 5 orders
data-agent optimize \
  --warehouses '[{"id":"WH1","x":0,"y":0,"capacity":10000,"current_inventory":5000},
                 {"id":"WH2","x":50,"y":50,"capacity":8000,"current_inventory":4000},
                 {"id":"WH3","x":100,"y":100,"capacity":9000,"current_inventory":4500}]' \
  --connections '[{"id":"C1","origin_warehouse_id":"WH1","destination_warehouse_id":"WH2","transit_days":2,"cost_per_unit":1.25},
                 {"id":"C2","origin_warehouse_id":"WH1","destination_warehouse_id":"WH3","transit_days":3,"cost_per_unit":1.50},
                 {"id":"C3","origin_warehouse_id":"WH2","destination_warehouse_id":"WH3","transit_days":2,"cost_per_unit":1.00},
                 {"id":"C4","origin_warehouse_id":"WH3","destination_warehouse_id":"WH1","transit_days":3,"cost_per_unit":1.50},
                 {"id":"C5","origin_warehouse_id":"WH3","destination_warehouse_id":"WH2","transit_days":2,"cost_per_unit":1.00}]' \
  --orders '[{"id":"O1","quantity":100,"x":5,"y":5,"priority":1},
             {"id":"O2","quantity":150,"x":55,"y":55,"priority":2},
             {"id":"O3","quantity":200,"x":95,"y":95,"priority":1},
             {"id":"O4","quantity":120,"x":80,"y":80,"priority":2},
             {"id":"O5","quantity":180,"x":20,"y":20,"priority":3}]'
```

## Features

### Warehouse Connections (C1-C5)
The optimizer now supports 5 warehouse connections covering all pairs:
- **C1**: WH1 → WH2 (2 days, $1.25/unit)
- **C2**: WH1 → WH3 (3 days, $1.50/unit)
- **C3**: WH2 → WH3 (2 days, $1.00/unit)
- **C4**: WH3 → WH1 (3 days, $1.50/unit)
- **C5**: WH3 → WH2 (2 days, $1.00/unit)

Connection validation ensures:
- Origin and destination warehouses must exist
- Origin and destination must be different warehouses
- Transit days must be greater than zero
- Cost per unit cannot be negative

### Connection-Aware Routing
The RouteOptimizer includes a 5-unit distance bonus when orders are near
connected warehouse destinations, encouraging use of existing transport links.

### Output Format
```
Configured Connections:
  C1: WH1 -> WH2 (2 days, $1.25/unit)
  C2: WH1 -> WH3 (3 days, $1.50/unit)
  ...

Order Allocation:
  WH1: 2 orders
  WH2: 1 orders
  WH3: 2 orders

Optimized Routes:
  WH1:
    Total Distance: 56.57 units
    Orders: 2
  WH2:
    Total Distance: 14.14 units
    Orders: 1
  WH3:
    Total Distance: 56.57 units
    Orders: 2
```

## CLI Commands

### `data-agent optimize`
Run full supply chain optimization.

**Arguments:**
- `--warehouses` (required): JSON array of warehouse objects
  - Each warehouse needs: id, x, y, capacity, current_inventory
- `--connections` (optional): JSON array of connection objects
  - Each connection needs: id, origin_warehouse_id, destination_warehouse_id, transit_days, cost_per_unit
- `--orders` (optional): JSON array of order objects
  - Each order needs: id, quantity, x, y, priority

### `data-agent forecast`
Run demand forecasting using exponential smoothing.

**Arguments:**
- `--historical` (required): Comma-separated historical demand data
  - Example: `"100,120,110,130,125,115,140"`
- `--periods` (optional): Number of periods to forecast (default: 7)
- `--alpha` (optional): Smoothing factor between 0 and 1 (default: 0.3)

**Output:**
```
Historical data: [100.0, 120.0, 110.0, 130.0, 125.0, 115.0, 140.0]
Forecast (3 periods) using alpha=0.3:
  [100.00, 106.00, 110.20]
Average forecast: 105.40
```

### `data-agent eoq`
Calculate Economic Order Quantity.

**Arguments:**
- `annual_demand` (required): Annual demand volume (float)
- `--holding-cost` (optional): Holding cost per unit per year (default: 5.0)
- `--ordering-cost` (optional): Ordering cost per order (default: 50.0)

**Output:**
```
Annual demand: 10000.0
Holding cost: 5.0
Ordering cost: 50.0

EOQ: 447 units
Total cost at EOQ: 3354.10
```

## Testing
Run the complete test suite:
```bash
pytest tests/ -v  # (18 unit tests, 4 integration tests need GCP)
# Or specifically supply chain tests:
PYTHONPATH=/path/to/my-project python3 -m pytest tests/test_supply_chain_optimizer.py -v
# Output: 11 passed in 0.04s
```

## Output Example
Full end-to-end output with 5 connections and 5 orders:
```
Configured Connections:
  C1: WH1 -> WH2 (2 days, $1.25/unit)
  C2: WH1 -> WH3 (3 days, $1.50/unit)
  C3: WH2 -> WH3 (2 days, $1.00/unit)
  C4: WH3 -> WH1 (3 days, $1.50/unit)
  C5: WH3 -> WH2 (2 days, $1.00/unit)

Order Allocation:
  WH1: 2 orders
  WH2: 1 orders
  WH3: 2 orders

Optimized Routes:
  WH1:
    Total Distance: 56.57 units
    Orders: 2
  WH2:
    Total Distance: 14.14 units
    Orders: 1
  WH3:
    Total Distance: 56.57 units
    Orders: 2

Timestamp: 2026-08-12T19:55:03.043251
```
