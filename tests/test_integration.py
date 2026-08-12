"""Integration tests that hit real GCP using the active gcloud credentials."""

import pytest

from data_agent_kit.bigquery import BigQueryClient
from data_agent_kit.logging import LoggingClient
from data_agent_kit.pubsub import PubSubClient
from data_agent_kit.secret import SecretManagerClient
from data_agent_kit.storage import StorageClient


@pytest.mark.integration
def test_bigquery_run_query_real(gcp_project_id: str) -> None:
    client = BigQueryClient(project_id=gcp_project_id)
    result = client.run_query("SELECT 1 AS num")
    assert result == [{"num": 1}]


@pytest.mark.integration
def test_storage_list_buckets_real(gcp_project_id: str) -> None:
    client = StorageClient(project_id=gcp_project_id)
    buckets = client.list_buckets()
    assert isinstance(buckets, list)


@pytest.mark.integration
def test_logging_list_entries_real(gcp_project_id: str) -> None:
    client = LoggingClient(project_id=gcp_project_id)
    entries = client.list_log_entries(max_entries=5)
    assert isinstance(entries, list)


@pytest.mark.integration
def test_pubsub_list_topics_real(gcp_project_id: str) -> None:
    client = PubSubClient(project_id=gcp_project_id)
    topics = client.list_topics()
    assert isinstance(topics, list)


@pytest.mark.integration
def test_secret_list_secrets_real(gcp_project_id: str) -> None:
    from google.api_core.exceptions import PermissionDenied

    client = SecretManagerClient(project_id=gcp_project_id)
    try:
        secrets = client.list_secrets()
    except PermissionDenied as e:
        pytest.skip(f"Secret Manager API not enabled or billing required: {e}")
    assert isinstance(secrets, list)
