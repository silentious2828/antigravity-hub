"""Pytest suite for OmniRoute hub corruption resilience."""
from __future__ import annotations

import os
import sqlite3
from pathlib import Path

import pytest

from audit.audit_db import AuditDatabase
from audit.verify_chain import verify_chain


def test_chain_detects_partial_write_corruption(tmp_path):
    db_path = tmp_path / "audit" / "agent_audit_trail.db"
    db_path.parent.mkdir(parents=True, exist_ok=True)
    db = AuditDatabase(str(db_path))

    for i in range(5):
        db.log_event(
            request_id=f"POWER-TEST-{i}",
            triage_stage="Logistics",
            provider="DeepSeek",
            event_type="Draft Created",
            reasoning_step=f"Entry {i}",
            compression=0.0,
            metadata={},
        )

    is_valid, _, _ = verify_chain(str(db_path))
    assert is_valid is True

    file_size = db_path.stat().st_size
    truncated_size = max(0, file_size - 100)
    if truncated_size == 0:
        pytest.skip("Database file too small to truncate safely")

    with open(db_path, "ab") as f:
        os.truncate(f.fileno(), truncated_size)

    with pytest.raises((sqlite3.DatabaseError, Exception)):
        verify_chain(str(db_path))
