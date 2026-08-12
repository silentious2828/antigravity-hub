"""Command-line interface for data-agent-kit."""

from __future__ import annotations

import argparse
import json
import os
import sys


def _load_project_id() -> str | None:
    return os.environ.get("GCP_PROJECT_ID")


def cmd_bigquery(args: argparse.Namespace) -> None:
    from data_agent_kit import BigQueryClient

    client = BigQueryClient(project_id=_load_project_id())
    results = client.run_query(args.query)
    print(json.dumps(results, default=str, indent=2))


def cmd_storage(args: argparse.Namespace) -> None:
    from data_agent_kit import StorageClient

    client = StorageClient(project_id=_load_project_id())
    buckets = client.list_buckets()
    print(json.dumps(buckets, indent=2))


def cmd_pubsub(args: argparse.Namespace) -> None:
    from data_agent_kit import PubSubClient

    client = PubSubClient(project_id=_load_project_id())
    topics = client.list_topics()
    print(json.dumps(topics, indent=2))


def cmd_secret(args: argparse.Namespace) -> None:
    from data_agent_kit import SecretManagerClient

    client = SecretManagerClient(project_id=_load_project_id())
    if args.access:
        value = client.access_secret(args.access)
        print(value)
    else:
        secrets = client.list_secrets()
        print(json.dumps(secrets, indent=2))


def cmd_logging(args: argparse.Namespace) -> None:
    from data_agent_kit import LoggingClient

    client = LoggingClient(project_id=_load_project_id())
    entries = client.list_log_entries(filter_str=args.filter, max_entries=args.max_entries)
    print(json.dumps(entries, default=str, indent=2))


def cmd_optimize(args: argparse.Namespace) -> None:
    """Run supply chain optimization from the CLI."""
    from supply_chain_optimizer import SupplyChainOptimizer, Warehouse, Order, Connection

    opt = SupplyChainOptimizer()

    # Parse warehouses from JSON string
    warehouses = json.loads(args.warehouses)
    for wh in warehouses:
        opt.add_warehouse(Warehouse(
            id=wh["id"], name=wh.get("name", wh["id"]),
            x=wh["x"], y=wh["y"],
            capacity=wh.get("capacity", 10000),
            current_inventory=wh.get("current_inventory", 5000)
        ))

    # Parse connections from JSON string
    if args.connections:
        for conn in json.loads(args.connections):
            opt.add_connection(Connection(
                id=conn["id"],
                origin_warehouse_id=conn["origin_warehouse_id"],
                destination_warehouse_id=conn["destination_warehouse_id"],
                transit_days=conn["transit_days"],
                cost_per_unit=conn["cost_per_unit"]
            ))

    # Parse orders from JSON string
    if args.orders:
        for order in json.loads(args.orders):
            opt.add_order(Order(
                id=order["id"], quantity=order["quantity"],
                x=order["x"], y=order["y"], priority=order.get("priority", 3)
            ))

    # Run optimization
    result = opt.optimize()

    # Display results
    print("=" * 60)
    print("SUPPLY CHAIN OPTIMIZATION RESULTS")
    print("=" * 60)
    print(f"\nConfigured Connections:")
    for conn_id, conn in result["connections"].items():
        print(f"  {conn_id}: {conn['route']} "
              f"({conn['transit_days']} days, ${conn['cost_per_unit']:.2f}/unit)")

    print(f"\nOrder Allocation:")
    for wh_id, orders in result["allocation"].items():
        print(f"  {wh_id}: {len(orders)} orders")

    print(f"\nOptimized Routes:")
    for wh_id, route_info in result["routes"].items():
        print(f"  {wh_id}:")
        print(f"    Total Distance: {route_info['total_distance']:.2f} units")
        print(f"    Orders: {route_info['order_count']}")

    print(f"\nTimestamp: {result['timestamp']}")
    print("=" * 60)


def cmd_forecast(args: argparse.Namespace) -> None:
    """Run demand forecasting from the CLI."""
    from supply_chain_optimizer import DemandForecaster

    # Parse comma-separated string into list of floats
    historical = [float(x.strip()) for x in args.historical.split(",")]
    forecaster = DemandForecaster(alpha=args.alpha)
    values = forecaster.forecast(historical, periods=args.periods)

    # Format values as plain floats (not numpy float64)
    formatted_values = [float(v) for v in values]

    print("=" * 60)
    print("DEMAND FORECAST RESULTS")
    print("=" * 60)
    print(f"\nHistorical data: {historical}")
    print(f"Forecast ({args.periods} periods) using alpha={args.alpha}:")
    # Format each value to 2 decimal places for clean display
    formatted = [f"{v:.2f}" for v in formatted_values]
    print(f"  [{', '.join(formatted)}]")
    print(f"\nAverage forecast: {sum(formatted_values) / len(formatted_values):.2f}")
    print("=" * 60)


def cmd_eoq(args: argparse.Namespace) -> None:
    """Calculate Economic Order Quantity from the CLI."""
    from supply_chain_optimizer import InventoryOptimizer

    optimizer = InventoryOptimizer(
        holding_cost=args.holding_cost,
        ordering_cost=args.ordering_cost
    )
    eoq = optimizer.calculate_eoq(args.annual_demand)

    print("=" * 60)
    print("ECONOMIC ORDER QUANTITY (EOQ)")
    print("=" * 60)
    print(f"\nAnnual demand: {args.annual_demand}")
    print(f"Holding cost: {args.holding_cost}")
    print(f"Ordering cost: {args.ordering_cost}")
    print(f"\nEOQ: {eoq:.0f} units")
    total_cost = eoq * args.holding_cost + (args.annual_demand / eoq) * args.ordering_cost
    print(f"Total cost at EOQ: {total_cost:.2f}")
    print("=" * 60)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="data-agent",
        description="Google Cloud Data Agent Kit CLI",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_bq = sub.add_parser("bigquery", help="Run a BigQuery query")
    p_bq.add_argument("query", help="SQL query to execute")
    p_bq.set_defaults(func=cmd_bigquery)

    p_st = sub.add_parser("storage", help="List Cloud Storage buckets")
    p_st.set_defaults(func=cmd_storage)

    p_ps = sub.add_parser("pubsub", help="List Pub/Sub topics")
    p_ps.set_defaults(func=cmd_pubsub)

    p_sc = sub.add_parser("secret", help="Access or list secrets")
    p_sc.add_argument("--access", help="Secret ID to access (latest version)")
    p_sc.set_defaults(func=cmd_secret)

    p_lo = sub.add_parser("logs", help="List Cloud Logging entries")
    p_lo.add_argument("--filter", default="", help="Logs filter expression")
    p_lo.add_argument("--max-entries", type=int, default=10, help="Max entries to return")
    p_lo.set_defaults(func=cmd_logging)

    # supply chain optimization command
    p_oc = sub.add_parser("optimize", help="Run supply chain optimization")
    p_oc.add_argument(
        "--warehouses",
        required=True,
        help="JSON array of warehouse objects with id, x, y, capacity, current_inventory"
    )
    p_oc.add_argument(
        "--connections",
        required=False,
        default="[]",
        help="JSON array of connection objects with id, origin, destination, transit_days, cost_per_unit"
    )
    p_oc.add_argument(
        "--orders",
        required=False,
        default="[]",
        help="JSON array of order objects with id, quantity, x, y, priority"
    )
    p_oc.set_defaults(func=cmd_optimize)

    # forecast command
    p_fo = sub.add_parser("forecast", help="Run demand forecasting")
    p_fo.add_argument(
        "--historical",
        required=True,
        help="Comma-separated historical demand data (e.g. '100,120,110,130')"
    )
    p_fo.add_argument(
        "--periods",
        type=int,
        default=7,
        help="Number of periods to forecast (default: 7)"
    )
    p_fo.add_argument(
        "--alpha",
        type=float,
        default=0.3,
        help="Smoothing factor between 0 and 1 (default: 0.3)"
    )
    p_fo.set_defaults(func=cmd_forecast)

    # EOQ command
    p_eq = sub.add_parser("eoq", help="Calculate Economic Order Quantity")
    p_eq.add_argument(
        "annual_demand",
        type=float,
        help="Annual demand volume"
    )
    p_eq.add_argument(
        "--holding-cost",
        type=float,
        default=5.0,
        help="Holding cost per unit per year (default: 5.0)"
    )
    p_eq.add_argument(
        "--ordering-cost",
        type=float,
        default=50.0,
        help="Ordering cost per order (default: 50.0)"
    )
    p_eq.set_defaults(func=cmd_eoq)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.func(args)
    return 0


if __name__ == "__main__":
    sys.exit(main())
