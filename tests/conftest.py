from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from src.main import app

FRONTEND_ROOT = Path(__file__).resolve().parent.parent


@pytest.fixture(scope="session")
def frontend_dir():
    """Returns the root directory of the frontend project containing static assets."""
    return FRONTEND_ROOT


@pytest.fixture
def client():
    """FastAPI TestClient for querying server endpoints."""
    with TestClient(app) as test_client:
        yield test_client
