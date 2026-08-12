from unittest.mock import MagicMock

import pytest

from data_agent_kit import secret as secret_module


def test_access_secret(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_api = MagicMock()
    mock_response = MagicMock()
    mock_response.payload.data = b"super-secret-value"
    mock_api.access_secret_version.return_value = mock_response

    monkeypatch.setattr(secret_module, "secretmanager", MagicMock())
    monkeypatch.setattr(secret_module.secretmanager, "SecretManagerServiceClient", MagicMock(return_value=mock_api))

    from data_agent_kit.secret import SecretManagerClient

    client = SecretManagerClient(project_id="test-project")
    result = client.access_secret("my-secret")
    assert result == "super-secret-value"
    mock_api.access_secret_version.assert_called_once_with(
        request={"name": "projects/test-project/secrets/my-secret/versions/latest"}
    )


def test_list_secrets(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_api = MagicMock()
    mock_secret = MagicMock()
    mock_secret.name = "projects/test-project/secrets/my-secret"
    mock_api.list_secrets.return_value = [mock_secret]

    monkeypatch.setattr(secret_module, "secretmanager", MagicMock())
    monkeypatch.setattr(secret_module.secretmanager, "SecretManagerServiceClient", MagicMock(return_value=mock_api))

    from data_agent_kit.secret import SecretManagerClient

    client = SecretManagerClient(project_id="test-project")
    result = client.list_secrets()
    assert result == ["projects/test-project/secrets/my-secret"]
    mock_api.list_secrets.assert_called_once_with(request={"parent": "projects/test-project"})
