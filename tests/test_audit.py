"""Pytest suite for OmniRoute hub routing and audit integrity."""
from __future__ import annotations

import sqlite3
from pathlib import Path

import pytest

from audit.audit_db import AuditDatabase, compute_integrity_hash
from audit.verify_chain import verify_chain
from crewai_flow.state_model import EmailProvider, TriageCategory
from crewai_flow.triage_flow import TriageFlow


@pytest.fixture()
def test_db(tmp_path):
    db_path = tmp_path / "audit" / "agent_audit_trail.db"
    db_path.parent.mkdir(parents=True, exist_ok=True)
    return str(db_path)


def test_gmail_logistics_routes_to_gmail(test_db):
    flow = TriageFlow(audit_db=AuditDatabase(test_db))
    payload = {
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
    state = flow.run(payload)
    assert state.draft.provider == EmailProvider.GMAIL
    assert state.current_step == "gmail_draft_created"


def test_outlook_cleanup_routes_to_outlook(test_db):
    flow = TriageFlow(audit_db=AuditDatabase(test_db))
    payload = {
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
    state = flow.run(payload)
    assert state.draft.provider == EmailProvider.OUTLOOK
    assert state.current_step == "outlook_draft_created"


def test_audit_chain_is_intact_after_multiple_events(test_db):
    flow = TriageFlow(audit_db=AuditDatabase(test_db))
    for payload in [
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
    ]:
        flow.run(payload)

    is_valid, error, rows = verify_chain(test_db)
    assert is_valid is True, f"Chain invalid: {error}"
    assert rows >= 2


def test_tampered_entry_breaks_chain(test_db):
    db = AuditDatabase(test_db)
    db.log_event(
        request_id="REQ-TAMPER",
        triage_stage="Logistics Priority",
        provider="gmail",
        event_type="provider_selection",
        reasoning_step="Original reasoning",
        compression=0.0,
        metadata={},
    )

    with sqlite3.connect(test_db) as conn:
        conn.execute(
            "UPDATE agent_audit_trail SET reasoning_step=? WHERE request_id=?",
            ("Tampered reasoning", "REQ-TAMPER"),
        )
        conn.commit()

    is_valid, error, rows = verify_chain(test_db)
    assert is_valid is False
    assert error is not None


def test_compute_integrity_hash_is_deterministic():
    entry = {
        "timestamp": "2026-08-13T00:00:00",
        "request_id": "REQ-1",
        "triage_stage": "Logistics Priority",
        "provider": "gmail",
        "event_type": "provider_selection",
        "reasoning_step": "Test",
        "compression": 0.0,
        "metadata": {},
    }
    first = compute_integrity_hash(entry, "")
    second = compute_integrity_hash(entry, "")
    assert first == second
    assert len(first) == 64
