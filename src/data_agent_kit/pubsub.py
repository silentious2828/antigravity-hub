"""Google Cloud Pub/Sub client wrapper."""

from __future__ import annotations

from google.cloud import pubsub_v1


class PubSubClient:
    def __init__(self, project_id: str | None = None) -> None:
        self.project_id = project_id
        self._publisher = pubsub_v1.PublisherClient()

    def list_topics(self) -> list[str]:
        parent = f"projects/{self.project_id}"
        return [topic.name for topic in self._publisher.list_topics(request={"project": parent})]
