import os
import sys
from pathlib import Path

# Add project root to path so that root-level modules (audit/, supply_chain_optimizer.py) are importable
project_root = str(Path(__file__).parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import pytest


@pytest.fixture
def gcp_project_id() -> str:
    return os.environ.get("GCP_PROJECT_ID", "test-project")
