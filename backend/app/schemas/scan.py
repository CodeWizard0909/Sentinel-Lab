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
    """Request body for creating a new scan (Frontend sends this)."""
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
    status: ScanStatus = ScanStatus.QUEUED


class ScanDetail(BaseModel):
    """Full scan detail for GET /scans/{scanId} — Matches Frontend UI State."""
    model_config = ConfigDict(populate_by_name=True)

    scan_id: str = Field(..., alias="scan_id")
    project_name: str = Field(..., alias="project_name")
    status: ScanStatus
    created_at: str = Field("", alias="created_at")
    completed_at: Optional[str] = Field(None, alias="completed_at")
    issues: list = Field(default_factory=list)
    repairs: list = Field(default_factory=list)
    
    # Custom payload mapping to frontend's sandbox objects
    baseline_sandbox: Optional[dict] = None
    repaired_sandbox: Optional[dict] = None
    
    # Custom payload mapping to frontend's verdict object
    verdict: Optional[dict] = None
    
    error: Optional[str] = None
