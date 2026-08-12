# data-agent-kit CLI Guide

## Overview
The `data-agent` command-line tool for the Google Cloud Data Agent Kit.
Run supply chain optimization, demand forecasting, EOQ calculations, and
access Google Cloud services.

## Installation
```bash
# Install the package in development mode
cd my-project
pip install -e .

# Or using the pre-configured venv
# .venv/bin/pip install -e .
```

## CLI Commands

### `data-agent bigquery`
Run a BigQuery query.

**Usage:**
```bash
data-agent bigquery "SELECT 1 AS num"
```

**Arguments:**
- `query` (required): SQL query to execute

### `data-agent storage`
List Cloud Storage buckets.

**Usage:**
```bash
data-agent storage
```

**Arguments:** None

### `data-agent pubsub`
List Pub/Sub topics.

**Usage:**
```bash
data-agent pubsub
```

**Arguments:** None

### `data-agent secret`
Access or list secrets.

**Usage:**
```bash
# Access a specific secret
data-agent secret --access my-secret-id

# List all secrets
data-agent secret
```

**Arguments:**
- `--access` (optional): Secret ID to access (latest version)

### `data-agent logs`
List Cloud Logging entries.

**Usage:**
```bash
# With filter and max entries
data-agent logs --filter "severity>=WARNING" --max-entries 20

# With just a filter
data-agent logs --filter "resource.labels.project_id = my-project"

# Default usage (last 10 entries)
data-agent logs
```

**Arguments:**
- `--filter` (optional): Logs filter expression (default: "")
- `--max-entries` (optional): Max entries to return (default: 10)

### `data-agent optimize`
Run supply chain optimization from the CLI.

**Usage:**
```bash
data-agent optimize \
  --warehouses '[JSON array]' \
  --connections '[JSON array]' \
  --orders '[JSON array]'
```

**Arguments:**
- `--warehouses` (required): JSON array of warehouse objects
  - Each warehouse needs: id, x, y, capacity, current_inventory
- `--connections` (optional): JSON array of connection objects
  - Each connection needs: id, origin_warehouse_id, destination_warehouse_id, transit_days, cost_per_unit
- `--orders` (optional): JSON array of order objects
  - Each order needs: id, quantity, x, y, priority

**Output Example:**
```
Configured Connections:
  C1: WH1 -> WH2 (2 days, $1.25/unit)

Order Allocation:
  WH1: 1 orders
  WH2: 0 orders
  WH3: 0 orders

Optimized Routes:
  WH1:
    Total Distance: 14.14 units
    Orders: 1

Timestamp: 2026-08-12T20:22:46.819860
```

### `data-agent forecast`
Run demand forecasting using exponential smoothing.

**Usage:**
```bash
data-agent forecast --historical "100,120,110,130,125,115,140" --periods 3 --alpha 0.3
```

**Arguments:**
- `--historical` (required): Comma-separated historical demand data
  - Example: `"100,120,110,130,125,115,140"`
- `--periods` (optional): Number of periods to forecast (default: 7)
- `--alpha` (optional): Smoothing factor between 0 and 1 (default: 0.3)

**Output Example:**
```
Historical data: [100.0, 120.0, 110.0, 130.0, 125.0, 115.0, 140.0]
Forecast (3 periods) using alpha=0.3:
  [100.00, 106.00, 110.20]

Average forecast: 105.40
```

### `data-agent eoq`
Calculate Economic Order Quantity.

**Usage:**
```bash
data-agent eoq 10000 --holding-cost 5 --ordering-cost 50
```

**Arguments:**
- `annual_demand` (required): Annual demand volume (float)
- `--holding-cost` (optional): Holding cost per unit per year (default: 5.0)
- `--ordering-cost` (optional): Ordering cost per order (default: 50.0)

**Output Example:**
```
Annual demand: 10000.0
Holding cost: 5.0
Ordering cost: 50.0

EOQ: 447 units
Total cost at EOQ: 3354.10
```

## Full CLI Workflow Example

```bash
# End-to-end supply chain management
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

# Then forecast demand
data-agent forecast --historical "100,120,110,130,125,115,140" --periods 7 --alpha 0.3

# Then calculate EOQ
data-agent eoq 365 * 110  # Annual demand = daily avg * 365
```

## Troubleshooting

### Common Issues

1. **ModuleNotFoundError: No module named 'numpy'**
   - Solution: `pip install numpy`

2. **ModuleNotFoundError: No module named 'data_agent_kit'**
   - Solution: `pip install -e .` from the my-project directory

3. **ModuleNotFoundError: No module named 'data_agent_kit.cli'**
   - Solution: Ensure PYTHONPATH is set, or install the package

4. **Validation errors in optimize**
   - Solution: Check JSON format for --warehouses, --connections, --orders
   - Warehouses need: id, x, y, capacity, current_inventory
   - Connections need: id, origin_warehouse_id, destination_warehouse_id, transit_days, cost_per_unit
   - Orders need: id, quantity, x, y, priority

5. **forecast gives dtype error**
   - Solution: Ensure historical data is comma-separated numbers, not a Python list string
   - Use: `"100,120,110"` not `"[100, 120, 110]"`

## Development

### Adding New CLI Commands
1. Define the function (e.g., `def cmd_new_command(args)`)
2. Add argument parser definition in `build_parser()`
3. Add `p_new.set_defaults(func=cmd_new_command)`
4. Implement the function logic
5. Test: `data-agent new-command ...`

### Package Configuration
The `pyproject.toml` configures:
- Package name: `data-agent-kit`
- Entry point: `data-agent = "data_agent_kit.cli:main"`
- Test paths: `tests/`
- Optional dependencies for GCP services

## Credits

Built as part of the Kilo agent workflow, integrating with:
- supply_chain_optimizer.py (optimization logic)
- AI_Enterprise_Operational_Dashboard.ipynb (Stripe integration)
- supply-chain-api (FastAPI service)
- Kilo agent architecture (.kilo/agents/ specs)
EOF
echo "CLI guide created"