"""Supply Chain AI API entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.optimization import router as optimization_router
from .routes.analytics import router as analytics_router
from .routes.frontend import router as frontend_router

app = FastAPI(
    title="Supply Chain AI API",
    version="0.1.0",
    description="Inventory, forecasting, and routing optimization endpoints.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(optimization_router)
app.include_router(analytics_router)
app.include_router(frontend_router)


@app.get("/health", tags=["meta"])
def health():
    """Liveness check for monitoring / uptime tools."""
    return {"status": "ok", "service": "supply-chain-api", "version": app.version}
