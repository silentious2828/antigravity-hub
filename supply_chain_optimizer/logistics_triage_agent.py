import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from crewai_flow.triage_flow import TriageFlow
from tools.agent_emitter import emit_audit_event


class LogisticsTriageAgent:
    """
    Autonomous handler representing our 'logistics-analyst' persona.
    Orchestrates ingestion, executes initial screening, and triggers TriageFlow.
    """

    def __init__(self, agent_id: str = "agent-logistics-analyst-01"):
        self.agent_id = agent_id
        self.persona = "Senior Logistics Triage Specialist"
        print(f"🤖 [{self.agent_id}] Initialized as: {self.persona}")

    def ingest_and_triage(self, raw_payload: dict):
        """
        Ingests raw inbox event data, processes domain mapping, and fires the flow.
        """
        print(f"\n📥 [{self.agent_id}] Ingesting transaction request: {raw_payload.get('request_id', 'UNKNOWN')}")

        flow = TriageFlow()

        payload = {
            "message_id": raw_payload.get("request_id", "REQ-TEMP"),
            "source_inbox": raw_payload.get("source_inbox", "unknown"),
            "subject": raw_payload.get("subject", "No Subject"),
            "sender": raw_payload.get("sender", raw_payload.get("recipient", "ops-manager@enterprise.com")),
            "recipient": raw_payload.get("recipient", "N/A"),
            "received_at": raw_payload.get("received_at", __import__("datetime").datetime.utcnow().isoformat()),
            "body_preview": raw_payload.get("body_preview", ""),
            "headers": raw_payload.get("headers", {}),
        }

        if "urgent" in payload["subject"].lower() or raw_payload.get("urgency") == "high":
            payload["headers"]["x-urgency"] = "high"

        try:
            result = flow.run(payload)
            action = result.triage.provider_action.value if result.triage else "unknown"
            print(f"✅ [{self.agent_id}] Flow execution completed successfully via handler: {action}")
        except Exception as e:
            print(f"❌ [{self.agent_id}] Operational failure during flow kickoff: {e}")
            emit_audit_event(
                provider="unknown",
                event_type="Runtime Crash",
                subject=raw_payload.get("subject", "No Subject"),
                recipient=raw_payload.get("recipient", "N/A"),
                status="Failed",
                compression=0.0
            )


if __name__ == "__main__":
    sample_job = {
        "request_id": "REQ-LIVE-045",
        "source_inbox": "gmail",
        "subject": "URGENT: Port Congestion - Singapore Terminal Block 4",
        "recipient": "ops-manager@enterprise.com",
        "urgency": "high"
    }

    agent = LogisticsTriageAgent()
    agent.ingest_and_triage(sample_job)
