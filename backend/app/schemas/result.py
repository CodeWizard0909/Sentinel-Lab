"""Result schemas — Judge verdict and final result."""

from enum import Enum
from pydantic import BaseModel, Field


class JudgeVerdict(str, Enum):
    """Judge agent verdict."""
    VERIFIED = "VERIFIED"
    FAILED = "FAILED"
    INCONCLUSIVE = "INCONCLUSIVE"


class FinalResult(BaseModel):
    """Output of the Judge Agent — final verification."""
    status: JudgeVerdict
    reason: str = ""
    issues_found: int = Field(0, alias="issuesFound")
    issues_fixed: int = Field(0, alias="issuesFixed")
    tests_passed: int = Field(0, alias="testsPassed")
    tests_failed: int = Field(0, alias="testsFailed")
    security_passed: bool = Field(True, alias="securityPassed")

    class Config:
        populate_by_name = True
        by_alias = True
