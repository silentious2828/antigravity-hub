"""Google Cloud Secret Manager client wrapper."""

from __future__ import annotations

from google.cloud import secretmanager


class SecretManagerClient:
    def __init__(self, project_id: str | None = None) -> None:
        self.project_id = project_id
        self._client = secretmanager.SecretManagerServiceClient()

    def access_secret(self, secret_id: str, version: str = "latest") -> str:
        name = f"projects/{self.project_id}/secrets/{secret_id}/versions/{version}"
        response = self._client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8")

    def list_secrets(self) -> list[str]:
        parent = f"projects/{self.project_id}"
        return [
            secret.name
            for secret in self._client.list_secrets(request={"parent": parent})
        ]
