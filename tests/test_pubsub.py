from unittest.mock import MagicMock

import pytest

from data_agent_kit import pubsub as pubsub_module


def test_list_topics(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_publisher = MagicMock()
    mock_topic = MagicMock()
    mock_topic.name = "projects/test-project/topics/my-topic"
    mock_publisher.list_topics.return_value = [mock_topic]

    monkeypatch.setattr(pubsub_module, "pubsub_v1", MagicMock())
    monkeypatch.setattr(pubsub_module.pubsub_v1, "PublisherClient", MagicMock(return_value=mock_publisher))

    from data_agent_kit.pubsub import PubSubClient

    client = PubSubClient(project_id="test-project")
    result = client.list_topics()
    assert result == ["projects/test-project/topics/my-topic"]
    mock_publisher.list_topics.assert_called_once_with(request={"project": "projects/test-project"})
