"""Tests for the SQL injection sample project.

These tests demonstrate both normal behavior and the SQL injection vulnerability.
"""

import sqlite3
import os
import pytest
from app import get_user, create_user, init_db


@pytest.fixture(autouse=True)
def setup_db():
    """Set up a fresh test database."""
    if os.path.exists("users.db"):
        os.remove("users.db")
    init_db()
    yield
    if os.path.exists("users.db"):
        os.remove("users.db")


def test_get_existing_user():
    """Normal query should return the user."""
    result = get_user("alice")
    assert result is not None
    assert result[1] == "alice"


def test_get_nonexistent_user():
    """Query for nonexistent user should return None."""
    result = get_user("nonexistent")
    assert result is None


def test_sql_injection_returns_data():
    """SQL injection should NOT return unauthorized data.

    This test EXPOSES the vulnerability — the vulnerable code
    will fail this test by returning data it shouldn't.
    """
    # This SQL injection payload should NOT work if properly parameterized
    result = get_user("' OR 1=1 --")
    assert result is None, "SQL injection returned data — vulnerability confirmed!"


def test_create_user():
    """Creating a user should work normally."""
    create_user("charlie", "charlie@example.com")
    result = get_user("charlie")
    assert result is not None
    assert result[1] == "charlie"
