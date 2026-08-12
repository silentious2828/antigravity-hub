from unittest.mock import MagicMock

import pytest

from data_agent_kit import logging as logging_module


def test_list_log_entries(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_client = MagicMock()
    mock_entry = MagicMock()
    mock_entry.log_name = "projects/test-project/logs/my-log"
    mock_entry.severity = MagicMock()
    mock_entry.severity.name = "INFO"
    mock_entry.payload = "Hello from Cloud Logging"
    mock_entry.resource = MagicMock()
    mock_entry.resource.type = "global"
    mock_client.list_entries.return_value = [mock_entry]

    monkeypatch.setattr(logging_module, "google_logging", MagicMock())
    monkeypatch.setattr(logging_module.google_logging, "Client", MagicMock(return_value=mock_client))

    from data_agent_kit.logging import LoggingClient

    client = LoggingClient(project_id="test-project")
    result = client.list_log_entries(filter_str="severity=INFO", max_entries=5)
    assert result == [{
        "log_name": "projects/test-project/logs/my-log",
        "severity": "INFO",
        "message": "Hello from Cloud Logging",
        "resource_type": "global",
    }]
    mock_client.list_entries.assert_called_once_with(filter_="severity=INFO", max_results=5)
