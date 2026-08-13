"""FastAPI WebSocket server for OmniRoute audit events."""
from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse

app = FastAPI()

latest_events: List[dict] = []
MAX_EVENTS = 500


class ConnectionManager:
    def __init__(self) -> None:
        self.active: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        try:
            self.active.remove(websocket)
        except ValueError:
            pass

    async def broadcast(self, payload: dict) -> None:
        dead: List[WebSocket] = []
        for ws in self.active:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


@app.get("/")
async def root():
    return {"status": "ok", "service": "omniroute-audit-server"}


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "events_received": len(latest_events),
        "connections": len(manager.active),
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                event = json.loads(data)
            except json.JSONDecodeError:
                event = {"raw": data}

            latest_events.append(event)
            if len(latest_events) > MAX_EVENTS:
                latest_events.pop(0)

            await websocket.send_json({"status": "received", "event": event})
            await manager.broadcast({"status": "broadcast", "event": event})
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        manager.disconnect(websocket)


@app.get("/events")
async def events():
    return {"count": len(latest_events), "events": latest_events[-50:]}


@app.post("/audit")
async def audit(payload: dict):
    latest_events.append(payload)
    if len(latest_events) > MAX_EVENTS:
        latest_events.pop(0)
    return {"status": "received"}


async def _periodic_verification() -> None:
    from audit.verify_chain import verify_chain

    while True:
        try:
            db_path = os.getenv("OMNIROUTE_AUDIT_DB", "audit/agent_audit_trail.db")
            is_valid, error_message, rows_verified = verify_chain(db_path)
            await manager.broadcast(
                {
                    "type": "health_update",
                    "status": "secure" if is_valid else "tampering",
                    "rows_verified": rows_verified,
                    "error": error_message,
                }
            )
        except Exception as exc:
            await manager.broadcast(
                {
                    "type": "health_update",
                    "status": "error",
                    "error": str(exc),
                }
            )
        await asyncio.sleep(300)


@app.on_event("startup")
async def startup_event() -> None:
    asyncio.create_task(_periodic_verification())


def run(host: str = "127.0.0.1", port: int = 20128):
    import uvicorn

    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    run()
