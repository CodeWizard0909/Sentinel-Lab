"""Tests for Pydantic schema validation."""

import pytest
from app.schemas.scan import ScanStatus, ScanCreate, ScanResponse, ScanDetail
from app.schemas.issue import Issue, IssueType, IssueSeverity
from app.schemas.repair import RepairResult, FixedFile
from app.schemas.sandbox import SandboxResult, SandboxStatus
from app.schemas.result import FinalResult, JudgeVerdict


def test_scan_status_values():
    """ScanStatus should have all expected values."""
    assert ScanStatus.QUEUED == "QUEUED"
    assert ScanStatus.ANALYZING == "ANALYZING"
    assert ScanStatus.COMPLETED == "COMPLETED"
    assert ScanStatus.FAILED == "FAILED"


def test_scan_create():
    """ScanCreate should accept projectName."""
    scan = ScanCreate(projectName="test")
    assert scan.project_name == "test"


def test_scan_create_validation():
    """ScanCreate should reject empty projectName."""
    with pytest.raises(Exception):
        ScanCreate(projectName="")


def test_issue_model():
    """Issue should accept valid data."""
    issue = Issue(
        id="issue_1",
        type=IssueType.SQL_INJECTION,
        severity=IssueSeverity.CRITICAL,
        file="app.py",
        line=6,
        description="SQL injection found",
    )
    assert issue.type == IssueType.SQL_INJECTION
    assert issue.severity == IssueSeverity.CRITICAL


def test_sandbox_result():
    """SandboxResult should accept valid data."""
    result = SandboxResult(
        status=SandboxStatus.PASS,
        testsPassed=10,
        testsFailed=0,
        securityPassed=True,
        executionTimeMs=1234,
    )
    assert result.tests_passed == 10
    assert result.security_passed is True


def test_final_result():
    """FinalResult should accept valid data."""
    result = FinalResult(
        status=JudgeVerdict.VERIFIED,
        reason="All tests passed",
        issuesFound=4,
        issuesFixed=4,
        testsPassed=14,
        testsFailed=0,
        securityPassed=True,
    )
    assert result.status == JudgeVerdict.VERIFIED
    assert result.issues_found == 4


def test_repair_result():
    """RepairResult should accept valid data."""
    result = RepairResult(
        fixedFiles=[
            FixedFile(file="app.py", fixedContent="fixed code", diff="diff text")
        ],
        explanation="Fixed the bug",
    )
    assert len(result.fixed_files) == 1
    assert result.explanation == "Fixed the bug"
