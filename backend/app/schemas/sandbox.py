"""Sandbox schemas — request and result models."""

from enum import Enum
from pydantic import BaseModel, Field, ConfigDict


class SandboxStatus(str, Enum):
    """Sandbox execution outcome."""
    PASS = "PASS"
    FAIL = "FAIL"
    ERROR = "ERROR"
    TIMEOUT = "TIMEOUT"


class SandboxRequest(BaseModel):
    """Input to the sandbox executor."""
    model_config = ConfigDict(populate_by_name=True)

    code: dict[str, str] = Field(default_factory=dict)
    language: str = "python"
    tests: dict[str, str] = Field(default_factory=dict)
    security_tests: dict[str, str] = Field(default_factory=dict, alias="securityTests")


class SandboxResult(BaseModel):
    """Output of sandbox execution."""
    model_config = ConfigDict(populate_by_name=True)

    status: SandboxStatus
    stdout: str = ""
    stderr: str = ""
    tests_passed: int = Field(0, alias="testsPassed")
    tests_failed: int = Field(0, alias="testsFailed")
    security_passed: bool = Field(True, alias="securityPassed")
    execution_time_ms: int = Field(0, alias="executionTimeMs")
