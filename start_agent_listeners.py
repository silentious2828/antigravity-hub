import asyncio
import json
import websockets
import sys
import os

ROOT = os.path.abspath(os.path.dirname(__file__))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "supply_chain_optimizer"))
sys.path.insert(0, os.path.join(ROOT, "ai-enterprise"))

from logistics_triage_agent import LogisticsTriageAgent
from stripe_sync_agent import StripeSyncAgent
from outlook_strategist_agent import OutlookStrategistAgent

FASTAPI_WS_URL = "ws://127.0.0.1:20128/ws"


async def stream_agent_ingestion():
    logistics_agent = LogisticsTriageAgent()
    stripe_agent = StripeSyncAgent()
    outlook_agent = OutlookStrategistAgent()

    print(f"\n📡 Connecting to OmniRoute WebSocket Gateway at {FASTAPI_WS_URL}...")

    while True:
        try:
            async with websockets.connect(FASTAPI_WS_URL) as websocket:
                print("⚡ Active socket channel open. Listening for live transactions...")
                async for message in websocket:
                    try:
                        payload = json.loads(message)
                    except json.JSONDecodeError:
                        print("⚠️ Ingested malformed text packet. Skipping.")
                        continue

                    if payload.get("status") == "broadcast":
                        payload = payload.get("event", payload)

                    if payload.get("source") == "agent":
                        continue

                    event_source = payload.get("source_inbox")
                    event_type = payload.get("type")
                    provider = payload.get("provider")

                    if event_source == "gmail":
                        print(f"\n📥 [ORCHESTRATOR] Routing inbox event {payload.get('request_id')} to Logistics Agent")
                        logistics_agent.ingest_and_triage(payload)

                    elif event_source == "outlook":
                        print(f"\n📥 [ORCHESTRATOR] Routing cleanup event {payload.get('request_id')} to Outlook Strategist")
                        outlook_agent.process_cleanup_event(payload)

                    elif provider == "stripe-webhook" or (event_type and event_type.startswith("customer.")):
                        print(f"\n📥 [ORCHESTRATOR] Routing webhook event {payload.get('id')} to Stripe Agent")
                        stripe_agent.process_webhook_event(payload)

                    elif payload.get("type") == "health_update":
                        continue

                    else:
                        print(f"❓ [ORCHESTRATOR] Unmapped broadcast payload received: {payload}")

        except websockets.ConnectionClosed:
            # Silenced connection noise: prints a concise status flag instead of flooding standard error logs
            print("📡 [SENTINEL] Gateway offline or recycling. Quietly polling for auto-reconnection...")
            await asyncio.sleep(5) # Incremented to 5s to reduce polling thrashing on your NVMe
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
