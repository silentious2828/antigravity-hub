#!/usr/bin/env python3
"""
SQLite Audit Database with Integrity Hashing

Provides a tamper-evident audit trail for the 45-agent Antigravity hub.
"""
from __future__ import annotations

import hashlib
import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional


# ---------------------------------------------------------------------------
# Integrity Hashing
# ---------------------------------------------------------------------------

def compute_integrity_hash(entry: Dict[str, Any], prev_hash: str = "") -> str:
    """Compute SHA-256 integrity hash for an audit entry."""
    payload = json.dumps(entry, sort_keys=True, default=str)
    chained_payload = prev_hash + payload
    return hashlib.sha256(chained_payload.encode("utf-8")).hexdigest()


# ---------------------------------------------------------------------------
# Audit Database
# ---------------------------------------------------------------------------

class AuditDatabase:
    """SQLite-backed audit database with integrity hashing."""

    def __init__(self, db_path: str = "audit/agent_audit_trail.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS agent_audit_trail (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')),
                    request_id TEXT NOT NULL,
                    triage_stage TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    reasoning_step TEXT,
                    compression REAL DEFAULT 0.0,
                    metadata JSON,
                    integrity_hash TEXT
                )
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_request_id 
                ON agent_audit_trail(request_id)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_timestamp 
                ON agent_audit_trail(timestamp)
            """)
            conn.commit()

    def log_event(
        self,
        request_id: str,
        triage_stage: str,
        provider: str,
        event_type: str,
        reasoning_step: Optional[str] = None,
        compression: float = 0.0,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        prev_hash = self._get_last_hash()

        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_id": request_id,
            "triage_stage": triage_stage,
            "provider": provider,
            "event_type": event_type,
            "reasoning_step": reasoning_step,
            "compression": compression,
            "metadata": metadata or {},
        }

        integrity_hash = compute_integrity_hash(entry, prev_hash)
        entry["integrity_hash"] = integrity_hash

        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO agent_audit_trail 
                (timestamp, request_id, triage_stage, provider, event_type, 
                 reasoning_step, compression, metadata, integrity_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    entry["timestamp"],
                    request_id,
                    triage_stage,
                    provider,
                    event_type,
                    reasoning_step,
                    compression,
                    json.dumps(metadata or {}, default=str),
                    integrity_hash,
                ),
            )
            conn.commit()

        return entry

    def _get_last_hash(self) -> str:
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT integrity_hash FROM agent_audit_trail ORDER BY id DESC LIMIT 1"
            )
            row = cursor.fetchone()
            return row["integrity_hash"] if row and row["integrity_hash"] else ""

    def verify_chain(self) -> tuple[bool, Optional[str]]:
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM agent_audit_trail ORDER BY id ASC"
            )
            rows = cursor.fetchall()

        prev_hash = ""
        for row in rows:
            entry = {
                "timestamp": row["timestamp"],
                "request_id": row["request_id"],
                "triage_stage": row["triage_stage"],
                "provider": row["provider"],
                "event_type": row["event_type"],
                "reasoning_step": row["reasoning_step"],
                "compression": row["compression"],
                "metadata": json.loads(row["metadata"] or "{}"),
            }
            expected_hash = compute_integrity_hash(entry, prev_hash)
            if expected_hash != row["integrity_hash"]:
                return False, f"Chain broken at row {row['id']}"
            prev_hash = row["integrity_hash"]

        return True, None

    def get_events_for_request(self, request_id: str) -> list[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM agent_audit_trail WHERE request_id = ? ORDER BY timestamp ASC",
                (request_id,),
            )
            rows = cursor.fetchall()

        return [dict(row) for row in rows]

    def get_sankey_data(self, triage_stage: Optional[str] = None) -> list[Dict[str, Any]]:
        query = """
            SELECT 
                triage_stage as source,
                provider as target,
                COUNT(*) as value
            FROM agent_audit_trail
            WHERE event_type = 'provider_selection'
        """
        params = []
        if triage_stage:
            query += " AND triage_stage = ?"
            params.append(triage_stage)
        query += " GROUP BY triage_stage, provider"

        with self._get_connection() as conn:
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()

        return [dict(row) for row in rows]


def get_default_db_path() -> str:
    return os.getenv("OMNIROUTE_AUDIT_DB", "audit/agent_audit_trail.db")


_audit_db = AuditDatabase(get_default_db_path())


def get_audit_db() -> AuditDatabase:
    return _audit_db


def reset_audit_db(db_path: Optional[str] = None) -> AuditDatabase:
    global _audit_db
    _audit_db = AuditDatabase(db_path or get_default_db_path())
    return _audit_db
