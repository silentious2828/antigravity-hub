import os

import pytest


@pytest.fixture
def gcp_project_id() -> str:
    return os.environ.get("GCP_PROJECT_ID", "test-project")
