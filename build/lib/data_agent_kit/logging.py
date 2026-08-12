"""Google Cloud Logging client wrapper."""

from __future__ import annotations

from google.cloud import logging as google_logging


def _severity_name(severity) -> str | None:
    if severity is None:
        return None
    return getattr(severity, "name", None) or str(severity)


class LoggingClient:
    def __init__(self, project_id: str | None = None) -> None:
        self.project_id = project_id
        self._client = google_logging.Client(project=project_id)

    def list_log_entries(self, filter_str: str = "", max_entries: int = 10) -> list[dict]:
        entries = []
        for entry in self._client.list_entries(
            filter_=filter_str or None, max_results=max_entries
        ):
            entries.append({
                "log_name": entry.log_name,
                "severity": _severity_name(entry.severity),
                "message": entry.payload,
                "resource_type": entry.resource.type if entry.resource else None,
            })
        return entries
