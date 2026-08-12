import sys
import os
import json
import logging
from pydantic import BaseModel, Field

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tools.agent_emitter import emit_audit_event
from audit.audit_db import AuditDatabase

logging.basicConfig(
    filename="logs/stripe_agent.log",
    level=logging.INFO,
    format="%(message)s"
)


class StripeTransactionState(BaseModel):
    tx_id: str
    amount: float
    currency: str = "SGD"
    event_type: str
    customer_email: str
    status: str = "Pending"


class StripeSyncAgent:
    """
    Autonomous handler representing our 'stripe-analyst' persona.
    Parses fintech telemetry and updates the immutable ledger.
    """

    def __init__(self, agent_id: str = "agent-stripe-analyst-02"):
        self.agent_id = agent_id
        self.db_path = "audit/agent_audit_trail.db"
        print(f"🤖 [{self.agent_id}] Initialized for Revenue Telemetry Tracking.")

    def process_webhook_event(self, raw_event: dict):
        """
        Parses the transaction, writes structured metadata, and appends to the SHA-256 chain.
        """
        tx = StripeTransactionState(
            tx_id=raw_event.get("id", "TX-UNKNOWN"),
            amount=float(raw_event.get("amount", 0.0) / 100),
            currency=raw_event.get("currency", "sgd").upper(),
            event_type=raw_event.get("type", "unknown"),
            customer_email=raw_event.get("email", "anonymous@test.com"),
            status="Success"
        )

        print(f"\n💳 [{self.agent_id}] Processing fintech event: {tx.event_type} | ID: {tx.tx_id}")

        try:
            db = AuditDatabase(self.db_path)
            db.log_event(
                request_id=tx.tx_id,
                triage_stage="Fintech Sync",
                provider="stripe-webhook",
                event_type=f"Revenue Logged ({tx.event_type})",
                reasoning_step=f"Stripe webhook processed: {tx.event_type}",
                compression=0.0,
                metadata={
                    "amount": tx.amount,
                    "currency": tx.currency,
                    "customer_email": tx.customer_email,
                    "status": tx.status,
                },
            )
            print(f"🔗 [{self.agent_id}] Transaction cryptographically sealed into ledger.")
        except Exception as e:
            print(f"❌ [{self.agent_id}] Ledger write failed: {e}")
            return

        emit_audit_event(
            provider="stripe-webhook",
            event_type=tx.event_type,
            subject=f"Amount: {tx.currency} {tx.amount:.2f}",
            recipient=tx.customer_email,
            status=tx.status,
            compression=0.0,
            metadata={
                "amount": tx.amount,
                "currency": tx.currency,
                "customer_email": tx.customer_email,
            },
        )

        log_entry = {
            "agent_id": self.agent_id,
            "tx_id": tx.tx_id,
            "amount": tx.amount,
            "currency": tx.currency,
            "event_type": tx.event_type,
            "customer_email": tx.customer_email,
            "status": tx.status
        }
        logging.info(json.dumps(log_entry))
        print(f"✨ [{self.agent_id}] Event successfully streamed to dashboard stack.")


if __name__ == "__main__":
    mock_webhook = {
        "id": "evt_12345StripeEnterprise",
        "type": "customer.subscription.created",
        "amount": 29900,
        "currency": "sgd",
        "email": "corporate-client@transformation-global.sg"
    }

    sync_engine = StripeSyncAgent()
    sync_engine.process_webhook_event(mock_webhook)
