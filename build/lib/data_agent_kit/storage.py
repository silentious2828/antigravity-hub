"""Google Cloud Storage client wrapper."""

from __future__ import annotations

from typing import Any

from google.cloud import storage


class StorageClient:
    def __init__(self, project_id: str | None = None) -> None:
        self.project_id = project_id
        self._client = storage.Client(project=project_id)

    def list_buckets(self) -> list[str]:
        return [bucket.name for bucket in self._client.list_buckets()]
