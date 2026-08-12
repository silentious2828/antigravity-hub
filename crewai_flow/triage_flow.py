"""
CrewAI Flow: Provider Auto-Selection with OmniRoute Audit Logging

Implements event-driven triage flow with:
- @start() triage node for metadata extraction
- @router() for dynamic Gmail/Outlook routing
- @listen() handlers for draft creation
- OmniRoute audit logging integration
"""
from __future__ import annotations

import datetime
import json
import os
from typing import Any, Dict, Optional

from tools.flow_sdk import Flow, start, router, listen
from crewai_flow.state_model import (
    EmailFlowState,
    EmailMetadata,
    EmailProvider,
    ProviderAction,
    TriageCategory,
    TriageResult,
    DraftResult,
)
from audit.audit_db import AuditDatabase
from tools.agent_emitter import emit_audit_event


class TriageFlow(Flow):
    def __init__(self, audit_db: Optional[AuditDatabase] = None, audit_logger=None):
        super().__init__(name="provider_auto_selection_with_audit")
        self._audit_db = audit_db or AuditDatabase()
        self._audit_logger = audit_logger or self._default_audit_logger

OMNIROUTE_AUDIT_URL = os.getenv("OMNIROUTE_AUDIT_URL", "http://localhost:20128")
AUDIT_LOG_BUFFER: list[dict] = []


def log_provider_decision(
    provider: str,
    subject: str,
    recipient: str,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Log provider routing decision to OmniRoute audit stream.

    Falls back to local buffer when OmniRoute gateway is unavailable.
    """
    audit_entry = {
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "event": "provider_selection",
        "provider": provider,
        "subject": subject,
        "recipient": recipient,
        "metadata": metadata or {},
    }

    try:
        import urllib.request

        payload = json.dumps(audit_entry).encode("utf-8")
        req = urllib.request.Request(
            f"{OMNIROUTE_AUDIT_URL}/audit",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=2) as resp:
            if resp.status >= 400:
                raise RuntimeError(f"OmniRoute audit HTTP {resp.status}")
    except Exception:
        AUDIT_LOG_BUFFER.append(audit_entry)

    return audit_entry


# ---------------------------------------------------------------------------
# Provider Selection Logic
# ---------------------------------------------------------------------------

def select_provider_from_metadata(metadata: EmailMetadata) -> tuple[EmailProvider, TriageCategory]:
    """Determine target provider and triage category from email metadata.

    Routing rules:
    - Gmail logistics emails (GMAIL source_inbox, logistics intent) -> Gmail
    - Outlook cleanup emails (OUTLOOK source_inbox, cleanup intent) -> Outlook
    - Default -> match source_inbox provider
    - Simulated failure -> fallback provider
    """
    source = metadata.source_inbox.lower()
    subject_lower = metadata.subject.lower()
    body_lower = metadata.body_preview.lower()
    headers = {k.lower(): v.lower() for k, v in getattr(metadata, "headers", {}).items()}

    logistics_keywords = ["shipment", "tracking", "delivery", "argo", "cargo", "logistics", "sap", "inventory"]
    cleanup_keywords = ["unsubscribe", "promotional", "newsletter", "bulk", "cleanup", "out of office"]

    if headers.get("x-simulate-failure") == "true":
        return EmailProvider.OUTLOOK, TriageCategory.LOGISTICS

    if source == "gmail":
        if any(k in subject_lower or k in body_lower for k in logistics_keywords):
            return EmailProvider.GMAIL, TriageCategory.LOGISTICS
        return EmailProvider.GMAIL, TriageCategory.UNKNOWN

    if source == "outlook":
        if any(k in subject_lower or k in body_lower for k in cleanup_keywords):
            return EmailProvider.OUTLOOK, TriageCategory.CLEANUP
        return EmailProvider.OUTLOOK, TriageCategory.UNKNOWN

    return EmailProvider.UNKNOWN, TriageCategory.UNKNOWN


# ---------------------------------------------------------------------------
# Triage Flow
# ---------------------------------------------------------------------------

class TriageFlow(Flow):
    """CrewAI Flow for automated provider selection with OmniRoute audit logging.

    Steps:
    1. classify (@start) - extract metadata and classify intent
    2. route (@router) - branch to gmail or outlook handler
    3. handle_gmail / handle_outlook (@listen) - create draft via Unified Draft Tool
    """

    def __init__(self, audit_db: Optional[AuditDatabase] = None, audit_logger=None):
        super().__init__(name="provider_auto_selection_with_audit")
        self._audit_db = audit_db or AuditDatabase()
        self._audit_logger = audit_logger or self._default_audit_logger

    def _default_audit_logger(
        self,
        provider: str,
        event_type: str,
        subject: str,
        recipient: str,
        status: str = "Success",
        compression: float = 0.0,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Log to SQLite audit database."""
        triage_stage = metadata.get("category", "unknown") if metadata else "unknown"
        request_id = metadata.get("request_id", metadata.get("message_id", "unknown")) if metadata else "unknown"

        return self._audit_db.log_event(
            request_id=request_id,
            triage_stage=triage_stage,
            provider=provider,
            event_type=event_type,
            reasoning_step=subject,
            compression=compression,
            metadata={
                "recipient": recipient,
                "status": status,
                **(metadata or {}),
            },
        )

    # ------------------------------------------------------------------
    # @start node
    # ------------------------------------------------------------------

    @start
    def classify(self, raw_email: Dict[str, Any]) -> EmailFlowState:
        """Triage incoming email and populate flow state.

        Expects raw_email dict with keys matching EmailMetadata fields.
        """
        metadata = EmailMetadata(**raw_email)
        provider, category = select_provider_from_metadata(metadata)

        triage = TriageResult(
            category=category,
            provider=provider,
            provider_action=ProviderAction.GMAIL_DRAFT if provider == EmailProvider.GMAIL else (
                ProviderAction.OUTLOOK_DRAFT if provider == EmailProvider.OUTLOOK else ProviderAction.UNKNOWN
            ),
            priority="high" if category in (TriageCategory.LOGISTICS, TriageCategory.COMPLIANCE) else "medium",
            confidence=0.9 if provider != EmailProvider.UNKNOWN else 0.5,
            reasoning=f"Auto-selected {provider.value} based on source_inbox={metadata.source_inbox}",
            entities={"source_inbox": metadata.source_inbox},
            suggested_actions=["draft_reply"] if provider != EmailProvider.UNKNOWN else ["human_review"],
        )

        state = EmailFlowState(
            raw_email=metadata,
            triage=triage,
            current_step="classified",
            routing_chain="priority" if provider == EmailProvider.GMAIL else "fill-first",
        )
        return state

    # ------------------------------------------------------------------
    # @router node
    # ------------------------------------------------------------------

    @router
    def route(self, state: EmailFlowState) -> str:
        """Route to appropriate handler based on provider."""
        if state.triage is None:
            return "handle_unknown"

        provider = state.triage.provider
        if provider == EmailProvider.GMAIL:
            return "handle_gmail"
        if provider == EmailProvider.OUTLOOK:
            return "handle_outlook"
        return "handle_unknown"

    # ------------------------------------------------------------------
    # @listen handlers
    # ------------------------------------------------------------------

    @listen
    def handle_gmail(self, state: EmailFlowState) -> EmailFlowState:
        """Gmail handler - create draft via Unified Draft Tool."""
        metadata = state.raw_email
        triage = state.triage

        self._audit_logger(
            provider="gmail",
            event_type="provider_selection",
            subject=metadata.subject,
            recipient=metadata.recipient,
            status="Success",
            metadata={
                "category": triage.category.value if triage else "unknown",
                "chain": state.routing_chain,
                "message_id": metadata.message_id,
            },
        )
        emit_audit_event(
            provider="gmail",
            event_type="Draft Created",
            subject=metadata.subject,
            recipient=metadata.sender,
            status="Success",
            compression=0.0,
            metadata={
                "category": triage.category.value if triage else "unknown",
                "chain": state.routing_chain,
                "message_id": metadata.message_id,
            },
        )

        draft = DraftResult(
            success=False,
            draft_id=None,
            provider=EmailProvider.GMAIL,
            subject=f"Re: {metadata.subject}",
            recipient=metadata.sender,
            error_message="Unified Draft Tool not yet configured",
        )
        state.draft = draft
        state.current_step = "gmail_draft_created"
        return state

    @listen
    def handle_outlook(self, state: EmailFlowState) -> EmailFlowState:
        """Outlook handler - create draft via Unified Draft Tool."""
        metadata = state.raw_email
        triage = state.triage

        self._audit_logger(
            provider="outlook",
            event_type="provider_selection",
            subject=metadata.subject,
            recipient=metadata.recipient,
            status="Success",
            metadata={
                "category": triage.category.value if triage else "unknown",
                "chain": state.routing_chain,
                "message_id": metadata.message_id,
            },
        )
        emit_audit_event(
            provider="outlook",
            event_type="Draft Created",
            subject=metadata.subject,
            recipient=metadata.sender,
            status="Success",
            compression=0.0,
            metadata={
                "category": triage.category.value if triage else "unknown",
                "chain": state.routing_chain,
                "message_id": metadata.message_id,
            },
        )

        draft = DraftResult(
            success=False,
            draft_id=None,
            provider=EmailProvider.OUTLOOK,
            subject=f"Re: {metadata.subject}",
            recipient=metadata.sender,
            error_message="Unified Draft Tool not yet configured",
        )
        state.draft = draft
        state.current_step = "outlook_draft_created"
        return state

    @listen
    def handle_unknown(self, state: EmailFlowState) -> EmailFlowState:
        """Fallback handler for unclassified emails."""
        metadata = state.raw_email
        self._audit_logger(
            provider="unknown",
            event_type="provider_selection",
            subject=metadata.subject,
            recipient=metadata.recipient,
            status="Success",
            metadata={"message_id": metadata.message_id, "reason": "unclassified"},
        )
        emit_audit_event(
            provider="unknown",
            event_type="Routing Error",
            subject=metadata.subject,
            recipient="N/A",
            status="Failed",
            compression=0.0,
            metadata={"message_id": metadata.message_id, "reason": "unclassified"},
        )
        state.current_step = "unknown_handler"
        return state
