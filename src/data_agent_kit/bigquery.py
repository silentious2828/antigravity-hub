"""Google Cloud BigQuery client wrapper."""

from __future__ import annotations

from typing import Any

from google.cloud import bigquery


class BigQueryClient:
    def __init__(self, project_id: str | None = None) -> None:
        self.project_id = project_id
        self._client = bigquery.Client(project=project_id)

    def run_query(self, query: str) -> list[dict[str, Any]]:
        job = self._client.query(query)
        results = job.result()
        return [dict(row) for row in results]
