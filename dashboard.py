"""Streamlit dashboard for OmniRoute hub monitoring."""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import plotly.graph_objects as go
import requests
import streamlit as st

AUDIT_DB_PATH = Path("audit/agent_audit_trail.db")
SERVER_URL = "http://127.0.0.1:20128"
WS_URL = "ws://127.0.0.1:20128/ws"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(AUDIT_DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def fetch_events(limit: int = 200) -> List[Dict[str, Any]]:
    if not AUDIT_DB_PATH.exists():
        return []
    with get_connection() as conn:
        cursor = conn.execute(
            "SELECT * FROM agent_audit_trail ORDER BY timestamp DESC LIMIT ?",
            (limit,),
        )
        rows = cursor.fetchall()
    return [dict(row) for row in rows]


def compute_chain_health(events: List[Dict[str, Any]]) -> Tuple[bool, Optional[str], int]:
    """Recompute integrity for the visible dataset."""
    from audit.audit_db import compute_integrity_hash

    if not events:
        return True, None, 0

    prev_hash = ""
    for idx, row in enumerate(reversed(events)):
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
            return False, f"Chain broken at row {row['id']}", len(events) - idx
        prev_hash = row["integrity_hash"]

    return True, None, len(events)


def render_health_badge(is_valid: bool, events_count: int) -> None:
    if is_valid:
        st.success("✅ INTEGRITY VERIFIED")
        st.caption(f"Ledger Status: Secure • Events checked: {events_count}")
    else:
        st.error("❌ TAMPERING DETECTED")
        st.warning("Action Required: Forensic Audit Recommended")


def render_sankey(events: List[Dict[str, Any]]) -> None:
    if not events:
        st.info("No audit events yet.")
        return

    stages = []
    providers = []
    event_types = []
    for row in events:
        stages.append(row["triage_stage"] or "Unknown")
        providers.append(row["provider"] or "Unknown")
        event_types.append(row["event_type"] or "Unknown")

    unique_labels = list(dict.fromkeys(stages + providers + event_types))
    label_index = {label: idx for idx, label in enumerate(unique_labels)}

    sources: List[int] = []
    targets: List[int] = []
    values: List[int] = []

    for stage, provider, event_type in zip(stages, providers, event_types):
        sources += [label_index[stage], label_index[provider]]
        targets += [label_index[provider], label_index[event_type]]
        values += [1, 1]

    fig = go.Figure(
        data=[
            go.Sankey(
                node=dict(
                    pad=12,
                    thickness=18,
                    line=dict(color="black", width=0.4),
                    label=unique_labels,
                    color="rgba(31, 119, 180, 0.85)",
                ),
                link=dict(
                    source=sources,
                    target=targets,
                    value=values,
                    color="rgba(150, 150, 150, 0.25)",
                ),
            )
        ]
    )
    fig.update_layout(margin=dict(l=0, r=0, t=20, b=10), height=340)
    st.plotly_chart(fig, use_container_width=True)


def render_event_table(events: List[Dict[str, Any]]) -> None:
    if not events:
        st.info("No events yet.")
        return

    table_rows = []
    for row in events[:200]:
        table_rows.append(
            {
                "timestamp": row["timestamp"],
                "request_id": row["request_id"],
                "triage_stage": row["triage_stage"],
                "provider": row["provider"],
                "event_type": row["event_type"],
                "compression": row["compression"],
            }
        )
    st.dataframe(table_rows, use_container_width=True, height=320)


def render_lifecycle_telemetry() -> None:
    """
    Parses structured JSON entries from logs/outlook_agent.log to display operational data.
    """
    st.sidebar.markdown("### ⚙️ Lifecycle Operations")
    log_path = Path("logs/outlook_agent.log")
    if log_path.exists():
        with open(log_path, "r") as f:
            log_lines = f.readlines()

        recent_ops = [json.loads(line) for line in log_lines[-5:] if line.strip()]
        for op in recent_ops:
            st.sidebar.caption(
                f"🆔 {op.get('task_id', 'N/A')} | {op.get('action_type', 'N/A')} -> "
                f"{op.get('target_module', 'N/A')} ({op.get('status', 'N/A')})"
            )
    else:
        st.sidebar.info("No active infrastructure logs recorded.")


# ---------------------------------------------------------------------------
# Page layout
# ---------------------------------------------------------------------------

st.set_page_config(page_title="OmniRoute Hub", layout="wide")
st.title("🛡️ OmniRoute Hub Dashboard")

with st.sidebar:
    render_lifecycle_telemetry()

events = fetch_events(limit=500)
is_valid, error_message, checked_count = compute_chain_health(events)

col_health, col_info = st.columns([1, 3])
with col_health:
    render_health_badge(is_valid, checked_count)
with col_info:
    st.metric("Audit Events", len(events))
    if not is_valid and error_message:
        st.caption(f"First mismatch: {error_message}")

st.markdown("### 🔀 Reasoning Flow")
render_sankey(events)

st.markdown("### 📋 Recent Audit Events")
render_event_table(events)
