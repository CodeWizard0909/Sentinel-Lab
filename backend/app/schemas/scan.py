"""Scan schemas — status, creation, response models."""

from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ScanStatus(str, Enum):
    """Allowed scan statuses."""
    QUEUED = "QUEUED"
    ANALYZING = "ANALYZING"
    REPAIRING = "REPAIRING"
    TESTING = "TESTING"
    VERIFYING = "VERIFYING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class ScanCreate(BaseModel):
    """Request body for creating a new scan."""
    project_name: str = Field(..., min_length=1, max_length=100, alias="projectName")

    class Config:
        populate_by_name = True


class ScanResponse(BaseModel):
    """Response after creating a scan."""
    scan_id: str = Field(..., alias="scanId")
    project_name: str = Field(..., alias="projectName")
    upload_url: str = Field("", alias="uploadUrl")
    status: ScanStatus = ScanStatus.QUEUED

    class Config:
        populate_by_name = True
        by_alias = True


class ScanDetail(BaseModel):
    """Full scan detail for GET /scans/{scanId}."""
    scan_id: str = Field(..., alias="scanId")
    project_name: str = Field(..., alias="projectName")
    status: ScanStatus
    created_at: str = Field("", alias="createdAt")
    updated_at: str = Field("", alias="updatedAt")
    issues: Optional[list] = None
    repairs: Optional[dict] = None
    sandbox_result: Optional[dict] = Field(None, alias="sandboxResult")
    final_result: Optional[dict] = Field(None, alias="finalResult")
    error: Optional[str] = None

    class Config:
        populate_by_name = True
        by_alias = True
