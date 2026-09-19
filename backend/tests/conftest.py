"""Test fixtures for SentinelLab backend tests."""

import os
import pytest
from fastapi.testclient import TestClient

# Force mock mode for all tests
os.environ["MOCK_MODE"] = "true"

from app.main import app


@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def sample_source_files():
    """Sample vulnerable source files for testing."""
    return {
        "app.py": (
            'import sqlite3\n'
            '\n'
            'def get_user(username):\n'
            '    conn = sqlite3.connect("users.db")\n'
            '    cursor = conn.cursor()\n'
            '    query = f"SELECT * FROM users WHERE username = \'{username}\'"\n'
            '    cursor.execute(query)\n'
            '    return cursor.fetchone()\n'
        ),
        "test_app.py": (
            'from app import get_user\n'
            '\n'
            'def test_get_user():\n'
            '    result = get_user("alice")\n'
        ),
    }
