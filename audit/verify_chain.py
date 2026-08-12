#!/usr/bin/env python3
"""
Audit Chain Verification Script
Verifies the integrity of the SQLite audit trail hash chain.
"""
from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

from audit.audit_db import compute_integrity_hash


def verify_chain(db_path: str = "audit/agent_audit_trail.db") -> Tuple[bool, Optional[str], int]:
    """Verify the integrity of the entire audit chain.
    
    Args:
        db_path: Path to SQLite database
        
    Returns:
        Tuple of (is_valid, error_message, total_rows_verified)
    """
    if not Path(db_path).exists():
        return False, f"Database not found: {db_path}", 0
    
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    
    try:
        cursor = conn.execute(
            "SELECT * FROM agent_audit_trail ORDER BY id ASC"
        )
        rows = cursor.fetchall()
    finally:
        conn.close()
    
    if not rows:
        return True, "No entries to verify", 0
    
    prev_hash = ""
    for idx, row in enumerate(rows):
        entry = {
            "timestamp": row["timestamp"],
            "request_id": row["request_id"],
            "triage_stage": row["triage_stage"],
            "provider": row["provider"],
            "event_type": row["event_type"],
            "reasoning_step": row["reasoning_step"],
            "compression": row["compression"] or 0.0,
            "metadata": json.loads(row["metadata"] or "{}"),
        }
        
        expected_hash = compute_integrity_hash(entry, prev_hash)
        if expected_hash != row["integrity_hash"]:
            return False, f"Chain broken at row {row['id']} (position {idx + 1})", idx + 1
        
        prev_hash = row["integrity_hash"]
    
    return True, None, len(rows)


def main() -> int:
    """CLI entry point for chain verification."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Verify audit chain integrity")
    parser.add_argument(
        "--db",
        default="audit/agent_audit_trail.db",
        help="Path to SQLite database",
    )
    args = parser.parse_args()
    
    print("🔍 Verifying audit chain integrity...")
    print(f"   Database: {args.db}")
    print()
    
    is_valid, error_message, rows_verified = verify_chain(args.db)
    
    if is_valid:
        print(f"✅ Chain is INTACT")
        print(f"   Verified {rows_verified} entries")
        if rows_verified > 0:
            print("   All integrity hashes are valid")
        return 0
    else:
        print(f"❌ Chain is BROKEN")
        print(f"   Error: {error_message}")
        print(f"   Verified {rows_verified} entries before failure")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
