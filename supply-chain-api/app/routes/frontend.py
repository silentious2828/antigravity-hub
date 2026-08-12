"""Serve the static frontend."""
from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter(tags=["frontend"])

FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "static"


@router.get("/", include_in_schema=False)
def index():
    return FileResponse(FRONTEND_DIR / "index.html")


@router.get("/app", include_in_schema=False)
def app_page():
    return FileResponse(FRONTEND_DIR / "index.html")
