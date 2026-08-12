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

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.func(args)
    return 0


if __name__ == "__main__":
    sys.exit(main())
