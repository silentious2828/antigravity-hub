#!/usr/bin/env python3
"""
CLI runner for TriageFlow.

Simulates Gmail/Outlook triggers with realistic payloads.
"""
from __future__ import annotations

import argparse
import json
import sys

from crewai_flow.triage_flow import TriageFlow, log_provider_decision, AUDIT_LOG_BUFFER
from crewai_flow.state_model import EmailMetadata, EmailProvider


MOCK_GMAIL = {
    "message_id": "gmail-001",
    "subject": "Urgent: Shipment delayed - SAP PO 4500000123",
    "sender": "supply-chain@logistics-corp.com",
    "recipient": "user@gmail.com",
    "cc": [],
    "bcc": [],
    "headers": {"X-Provider": "gmail"},
    "body_preview": "Your shipment for SAP PO 4500000123 is delayed due to port congestion...",
    "received_at": "2026-08-13T00:00:00Z",
    "source_inbox": "gmail",
}

MOCK_OUTLOOK = {
    "message_id": "outlook-001",
    "subject": "Weekly Newsletter: Clean up your inbox",
    "sender": "newsletter@marketing.com",
    "recipient": "user@outlook.com",
    "cc": [],
    "bcc": [],
    "headers": {"X-Provider": "outlook"},
    "body_preview": "Here are this week's top stories... Unsubscribe",
    "received_at": "2026-08-13T00:00:00Z",
    "source_inbox": "outlook",
}


def run_demo(provider_hint: str = "all") -> int:
    flow = TriageFlow(audit_logger=log_provider_decision)

    test_cases = []
    if provider_hint in ("all", "gmail"):
        test_cases.append(("gmail", MOCK_GMAIL))
    if provider_hint in ("all", "outlook"):
        test_cases.append(("outlook", MOCK_OUTLOOK))

    results = []
    for name, payload in test_cases:
        print(f"\n{'='*60}")
        print(f"Testing {name.upper()} flow...")
        print(f"{'='*60}")

        state = flow.classify(payload)
        print(f"Classified: provider={state.triage.provider.value}, category={state.triage.category.value}")

        next_step = flow.route(state)
        print(f"Routed to: {next_step}")

        state = getattr(flow, next_step)(state)
        print(f"Current step: {state.current_step}")
        print(f"Draft result: success={state.draft.success if state.draft else 'N/A'}, error={state.draft.error_message if state.draft else 'N/A'}")

        results.append({
            "provider": name,
            "classified_provider": state.triage.provider.value,
            "routed_to": next_step,
            "draft_success": state.draft.success if state.draft else False,
        })

    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    for r in results:
        print(f"  {r['provider']}: classified={r['classified_provider']}, routed={r['routed_to']}, draft={r['draft_success']}")

    if AUDIT_LOG_BUFFER:
        print(f"\nAudit log buffer ({len(AUDIT_LOG_BUFFER)} entries):")
        for entry in AUDIT_LOG_BUFFER:
            print(f"  {entry['timestamp']} | {entry['provider']} | {entry['subject']}")

    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run TriageFlow demo")
    parser.add_argument("--provider", choices=["all", "gmail", "outlook"], default="all")
    args = parser.parse_args()
    sys.exit(run_demo(args.provider))
