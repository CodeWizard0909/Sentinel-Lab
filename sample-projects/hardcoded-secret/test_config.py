"""Tests for the hardcoded secret sample project.

These tests verify that secrets are NOT hardcoded in source code.
"""

import re
import inspect
from config import AppConfig, API_KEY, DATABASE_PASSWORD, JWT_SECRET, AWS_ACCESS_KEY, AWS_SECRET_KEY


def test_no_hardcoded_api_key():
    """API key should not be hardcoded in source code."""
    import config
    source = inspect.getsource(config)
    # Check for patterns that look like API keys
    assert not re.search(r'sk-proj-[a-zA-Z0-9]+', source), "Hardcoded API key found!"


def test_no_hardcoded_password():
    """Passwords should not be hardcoded in source code."""
    import config
    source = inspect.getsource(config)
    assert "super_secret_password" not in source, "Hardcoded password found!"


def test_no_hardcoded_jwt_secret():
    """JWT secret should not be hardcoded in source code."""
    import config
    source = inspect.getsource(config)
    assert "my-jwt-secret" not in source, "Hardcoded JWT secret found!"


def test_no_hardcoded_aws_keys():
    """AWS credentials should not be hardcoded in source code."""
    import config
    source = inspect.getsource(config)
    assert "AKIAIOSFODNN7EXAMPLE" not in source, "Hardcoded AWS access key found!"
    assert "wJalrXUtnFEMI" not in source, "Hardcoded AWS secret key found!"


def test_config_uses_env_vars():
    """Configuration should load secrets from environment variables."""
    import os
    # If properly fixed, config should use os.environ or similar
    config = AppConfig()
    # This test will pass once hardcoded values are replaced with env var lookups
    assert config.api_key != "sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234", \
        "API key is still hardcoded!"
