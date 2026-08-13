import asyncio
import json
import websockets
import sys
import os

ROOT = os.path.abspath(os.path.dirname(__file__))
sys.path.insert(0, ROOT)

FASTAPI_WS_URL = "ws://127.0.0.1:20128/ws"

LOGISTICS_PAYLOAD = {
    "request_id": "dual-test-logistics-001",
    "type": "shipment_triage",
    "source_inbox": "gmail",
    "subject": "Urgent: Shipment delayed - SAP PO 4500000123",
    "sender": "supply-chain@logistics-corp.com",
    "body_preview": "Your shipment for SAP PO 4500000123 is delayed due to port congestion...",
    "received_at": "2026-08-13T00:00:00Z",
    "priority": "high",
}

STRIPE_PAYLOAD = {
    "id": "dual-test-stripe-001",
    "type": "customer.subscription.created",
    "provider": "stripe-webhook",
    "data": {
        "object": {
            "id": "sub_1Test123",
            "customer": "cus_Test456",
            "status": "active",
            "plan": {
                "id": "plan_pro",
                "amount": 14900,
                "currency": "usd",
                "interval": "month",
            },
        }
    },
}


async def send_test_payloads():
    print("\n🧪 Dual-Stream Test Simulation")
    print("=" * 60)

    async with websockets.connect(FASTAPI_WS_URL) as websocket:
        print("✅ Connected to OmniRoute WebSocket Gateway")

        print("\n📤 [1/2] Injecting Logistics Payload...")
        await websocket.send(json.dumps(LOGISTICS_PAYLOAD))
        resp1 = await websocket.recv()
        print(f"📥 Response: {resp1[:200]}")

        print("\n📤 [2/2] Injecting Stripe Webhook Payload...")
        await websocket.send(json.dumps(STRIPE_PAYLOAD))
        resp2 = await websocket.recv()
        print(f"📥 Response: {resp2[:200]}")

    print("\n✅ Dual-channel test complete. Check listener logs for agent routing.")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(send_test_payloads())
