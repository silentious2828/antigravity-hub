#!/usr/bin/env python3
"""
Agent Emitter for CrewAI
Pushes audit events to FastAPI WebSocket server in real-time.
"""
from __future__ import annotations

import json
import os
from datetime import datetime
from typing import Any, Dict, Optional

try:
    import websocket  # type: ignore
    HAS_WEBSOCKET = True
except ImportError:
    HAS_WEBSOCKET = False

WS_URL = os.getenv("AGENT_EMITTER_WS_URL", "ws://localhost:20128/ws")


class Emitter:
    _enabled: bool = True

    @classmethod
    def disable(cls) -> None:
        cls._enabled = False

    @classmethod
    def enable(cls) -> None:
        cls._enabled = True


def emit_audit_event(
    provider: str,
    event_type: str,
    subject: str,
    recipient: str,
    status: str,
    compression: float = 0.0,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Push an audit event to the FastAPI WebSocket server.

    Falls back to print if WebSocket is unavailable.
    """
    payload = {
        "timestamp": datetime.utcnow().isoformat(),
        "source": "agent",
        "provider": provider,
        "event": event_type,
        "subject": subject,
        "recipient": recipient,
        "status": status,
        "compression": compression,
        "metadata": metadata or {},
    }

    if not HAS_WEBSOCKET:
        print(f"[EMITTER-FALLBACK] {payload}")
        return payload

    try:
        ws = websocket.create_connection(WS_URL, timeout=2)
        ws.send(json.dumps(payload))
        response = ws.recv()
        ws.close()
        print(f"[EMITTED] {event_type} for {subject} -> {response}")
        return payload
    except Exception as e:
        print(f"[ERROR] Failed to emit event: {e}")
        print(f"[FALLBACK] {payload}")
        return payload


def on_task_complete(
    provider: str,
    subject: str,
    recipient: str,
    status: str = "Success",
    compression: float = 0.0,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """CrewAI task callback wrapper for audit emission."""
    return emit_audit_event(
        provider=provider,
        event_type="Task Complete",
        subject=subject,
        recipient=recipient,
        status=status,
        compression=compression,
        metadata=metadata,
    )


def on_step_complete(
    provider: str,
    subject: str,
    recipient: str,
    step_name: str,
    status: str = "Success",
    compression: float = 0.0,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """CrewAI step callback wrapper for audit emission."""
    return emit_audit_event(
        provider=provider,
        event_type=f"Step Complete: {step_name}",
        subject=subject,
        recipient=recipient,
        status=status,
        compression=compression,
        metadata=metadata,
    )
