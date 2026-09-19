"""Scan schemas — status, creation, response models."""

from enum import Enum
from typing import Optional, Any
from pydantic import BaseModel, Field, ConfigDict


class ScanStatus(str, Enum):
    QUEUED = "QUEUED"
    ANALYZING = "ANALYZING"
    REPAIRING = "REPAIRING"
    SANDBOXING = "SANDBOXING"
    JUDGING = "JUDGING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    VERIFIED = "VERIFIED"


class ScanCreate(BaseModel):
    """Request body for creating a new scan."""
    model_config = ConfigDict(populate_by_name=True)

    project_name: str = Field(..., min_length=1, max_length=100, alias="projectName")
    code: str = ""
    language: str = "python"
    test_code: str = Field("", alias="testCode")
    model: Optional[str] = None


class ScanResponse(BaseModel):
    """Response after creating a scan."""
    model_config = ConfigDict(populate_by_name=True)

    scan_id: str = Field(..., alias="scanId")
    project_name: str = Field(..., alias="projectName")
    upload_url: str = Field("", alias="uploadUrl")
    status: ScanStatus = ScanStatus.QUEUED


class ScanDetail(BaseModel):
    """Full scan detail for GET /scans/{scanId}."""
    model_config = ConfigDict(populate_by_name=True)

    scan_id: str = Field(..., alias="scanId")
    project_name: str = Field(..., alias="projectName")
    status: ScanStatus
    created_at: str = Field("", alias="createdAt")
    completed_at: Optional[str] = Field(None, alias="completedAt")
    issues: list = Field(default_factory=list)
    repairs: list = Field(default_factory=list)
    baseline_sandbox: Optional[dict] = Field(None, alias="baseline_sandbox")
    repaired_sandbox: Optional[dict] = Field(None, alias="repaired_sandbox")
    verdict: Optional[dict] = None
    error: Optional[str] = None
