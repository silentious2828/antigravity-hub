#!/usr/bin/env python3
"""Extended shim harness: feed multiple payloads, print routing + audit results."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from crewai_flow.triage_flow import TriageFlow
from audit.verify_chain import verify_chain

MOCK_CASES = [
    {
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
    },
    {
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
    },
    {
        "message_id": "outlook-002",
        "subject": "Please review Q3 compliance attachments",
        "sender": "compliance@vendor.com",
        "recipient": "user@outlook.com",
        "cc": [],
        "bcc": [],
        "headers": {"X-Provider": "outlook"},
        "body_preview": "Attached are the Q3 compliance docs for your review.",
        "received_at": "2026-08-13T01:00:00Z",
        "source_inbox": "outlook",
    },
]


FAILOVER_CASE = {
    "message_id": "failover-001",
    "subject": "Simulated provider failure - fallback routing",
    "sender": "ops@hub.local",
    "recipient": "user@gmail.com",
    "cc": [],
    "bcc": [],
    "headers": {"X-Provider": "gmail", "X-Simulate-Failure": "true"},
    "body_preview": "Primary provider unavailable, routing to fallback...",
    "received_at": "2026-08-13T02:00:00Z",
    "source_inbox": "gmail",
}


def main() -> int:
    flow = TriageFlow()

    print("🚀 Running extended shim harness...\n")
    for idx, payload in enumerate(MOCK_CASES, start=1):
        print(f"--- Case {idx}: {payload['source_inbox'].upper()} ---")
        print(f"Subject: {payload['subject']}")
        result = flow.run(payload)
        print(f"Routed : {result.current_step}")
        print(f"Draft  : provider={result.draft.provider.value if result.draft else 'N/A'}, "
              f"success={result.draft.success if result.draft else 'N/A'}")
        print()

    print("🔍 Verifying audit chain...")
    is_valid, error, rows = verify_chain("audit/agent_audit_trail.db")
    if is_valid:
        print(f"✅ Integrity Verified: {rows} events checked. Chain is intact.\n")
    else:
        print(f"❌ Chain broken: {error}\n")
        return 1

    print("\n--- TC-06: Simulated Failover ---")
    print(f"Subject: {FAILOVER_CASE['subject']}")
    result = flow.run(FAILOVER_CASE)
    print(f"Routed : {result.current_step}")
    print(f"Draft  : provider={result.draft.provider.value if result.draft else 'N/A'}, "
          f"success={result.draft.success if result.draft else 'N/A'}")

    print("\n🔍 Verifying audit chain after failover...")
    is_valid, error, rows = verify_chain("audit/agent_audit_trail.db")
    if is_valid:
        print(f"✅ Integrity Verified: {rows} events checked. Chain is intact.\n")
    else:
        print(f"❌ Chain broken: {error}\n")
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
