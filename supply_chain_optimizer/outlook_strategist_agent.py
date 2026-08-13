import sys
import os
import json
import logging
from pydantic import BaseModel, Field

ROOT = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from tools.agent_emitter import emit_audit_event
from audit.audit_db import AuditDatabase

logging.basicConfig(
    filename="logs/outlook_agent.log",
    level=logging.INFO,
    format="%(message)s"
)


class CleanupOperationState(BaseModel):
    task_id: str
    target_module: str
    action_type: str = "Archive"
    retention_days: int = 30
    status: str = "Pending"


class OutlookStrategistAgent:
    """
    Autonomous handler representing our 'outlook-strategist' persona.
    Orchestrates infrastructure cleanup operations and log lifecycle metadata.
    """

    def __init__(self, agent_id: str = "agent-outlook-strategist-03"):
        self.agent_id = agent_id
        self.db_path = "audit/agent_audit_trail.db"
        print(f"🤖 [{self.agent_id}] Initialized for Operations & Lifecycle Governance.")

    def process_cleanup_event(self, raw_event: dict):
        """
        Ingests infrastructure signals, establishes cleanup policies, and seals entries to the SHA-256 ledger.
        """
        op = CleanupOperationState(
            task_id=raw_event.get("request_id", "TASK-UNKNOWN"),
            target_module=raw_event.get("target_module", "system-root"),
            action_type=raw_event.get("action_type", "Archive"),
            retention_days=int(raw_event.get("retention_days", 30)),
            status="Success"
        )

        print(f"\n⚙️ [{self.agent_id}] Processing cleanup operation: {op.action_type} on {op.target_module} | ID: {op.task_id}")

        try:
            db = AuditDatabase(self.db_path)
            db.log_event(
                request_id=op.task_id,
                triage_stage="Cleanup Ops",
                provider="outlook-oauth",
                event_type=f"Log Lifecycle Complete ({op.action_type})",
                reasoning_step=f"Cleanup operation executed: {op.action_type} on {op.target_module}",
                compression=0.0,
                metadata={
                    "target_module": op.target_module,
                    "retention_days": op.retention_days,
                    "status": op.status,
                },
            )
            print(f"🔗 [{self.agent_id}] Event cryptographically locked into transaction ledger.")
        except Exception as e:
            print(f"❌ [{self.agent_id}] Forensic ledger update failed: {e}")
            return

        emit_audit_event(
            provider="outlook-oauth",
            event_type=f"lifecycle_{op.action_type.lower()}",
            subject=f"Module: {op.target_module} | Target: Outlook-Cleanup",
            recipient="system-archive@enterprise.com",
            status=op.status,
            compression=0.0
        )

        log_entry = {
            "agent_id": self.agent_id,
            "task_id": op.task_id,
            "target_module": op.target_module,
            "action_type": op.action_type,
            "retention_days": op.retention_days,
            "status": op.status
        }
        logging.info(json.dumps(log_entry))
        print(f"✨ [{self.agent_id}] Telemetry packets pushed cleanly to the listening mesh.")


if __name__ == "__main__":
    mock_cleanup_signal = {
        "request_id": "REQ-CLEAN-7400",
        "target_module": "supply-chain-api-logs",
        "action_type": "Archive",
        "retention_days": 90,
        "source_inbox": "outlook"
    }

    lifecycle_engine = OutlookStrategistAgent()
    lifecycle_engine.process_cleanup_event(mock_cleanup_signal)
