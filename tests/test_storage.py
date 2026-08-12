from unittest.mock import MagicMock

import pytest

from data_agent_kit import storage as storage_module


def test_list_buckets(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_client = MagicMock()
    mock_bucket = MagicMock()
    mock_bucket.name = "my-bucket"
    mock_client.list_buckets.return_value = [mock_bucket]

    monkeypatch.setattr(storage_module, "storage", MagicMock())
    monkeypatch.setattr(storage_module.storage, "Client", MagicMock(return_value=mock_client))

    from data_agent_kit.storage import StorageClient

    client = StorageClient(project_id="test-project")
    result = client.list_buckets()
    assert result == ["my-bucket"]
    mock_client.list_buckets.assert_called_once()
