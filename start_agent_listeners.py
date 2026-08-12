import asyncio
import json
import websockets
import sys
import os

# Align Python paths for cross-directory imports
ROOT = os.path.abspath(os.path.dirname(__file__))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "supply_chain_optimizer"))
sys.path.insert(0, os.path.join(ROOT, "ai-enterprise"))

from logistics_triage_agent import LogisticsTriageAgent
from stripe_sync_agent import StripeSyncAgent

FASTAPI_WS_URL = "ws://127.0.0.1:20128/ws"


async def stream_agent_ingestion():
    """
    Establishes a dedicated, persistent WebSocket connection to the FastAPI server.
    Listens for live multi-channel events and routes them to the appropriate agent.
    """
    logistics_agent = LogisticsTriageAgent()
    stripe_agent = StripeSyncAgent()

    print(f"\n📡 Connecting to OmniRoute WebSocket Gateway at {FASTAPI_WS_URL}...")

    async for websocket in websockets.connect(FASTAPI_WS_URL):
        try:
            print("⚡ Active socket channel open. Listening for live transactions...")
            async for message in websocket:
                try:
                    payload = json.loads(message)
                except json.JSONDecodeError:
                    print("⚠️ Ingested malformed text packet. Skipping.")
                    continue

                event_source = payload.get("source_inbox")
                event_type = payload.get("type")
                provider = payload.get("provider")

                if event_source in ["gmail", "outlook"]:
                    print(f"\n📥 [ORCHESTRATOR] Routing inbox event {payload.get('request_id')} to Logistics Agent")
                    logistics_agent.ingest_and_triage(payload)

                elif event_type or provider == "stripe-webhook":
                    print(f"\n📥 [ORCHESTRATOR] Routing webhook event {payload.get('id')} to Stripe Agent")
                    stripe_agent.process_webhook_event(payload)

                else:
                    print(f"❓ [ORCHESTRATOR] Unmapped broadcast payload received: {payload}")

        except websockets.ConnectionClosed:
            print("⚠️ WebSocket connection dropped. Attempting automatic reconnection...")
            await asyncio.sleep(2)
            continue
        except Exception as e:
            print(f"❌ Critical exception in listener pool loop: {e}")
            await asyncio.sleep(2)
            continue


if __name__ == "__main__":
    try:
        asyncio.run(stream_agent_ingestion())
    except KeyboardInterrupt:
        print("\n🛑 Agent listener streams cleanly suspended.")
