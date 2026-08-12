from unittest.mock import MagicMock

import pytest

from data_agent_kit import bigquery as bigquery_module


def test_run_query(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_client = MagicMock()
    mock_row = {"name": "Alice", "age": 30}
    mock_job = MagicMock()
    mock_job.result.return_value = [mock_row]

    mock_client.query.return_value = mock_job
    monkeypatch.setattr(bigquery_module, "bigquery", MagicMock())
    monkeypatch.setattr(bigquery_module.bigquery, "Client", MagicMock(return_value=mock_client))

    from data_agent_kit.bigquery import BigQueryClient

    client = BigQueryClient(project_id="test-project")
    result = client.run_query("SELECT * FROM users")
    assert result == [mock_row]
    mock_client.query.assert_called_once_with("SELECT * FROM users")
