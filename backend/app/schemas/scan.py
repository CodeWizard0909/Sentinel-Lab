"""Scan schemas — status, creation, response models."""

from enum import Enum
from typing import Optional, Any
from pydantic import BaseModel, Field, ConfigDict


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
    model_config = ConfigDict(populate_by_name=True)

    project_name: str = Field(..., min_length=1, max_length=100, alias="projectName")


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
    updated_at: str = Field("", alias="updatedAt")
    issues: Optional[list[Any]] = None
    repairs: Optional[dict[str, Any]] = None
    sandbox_result: Optional[dict[str, Any]] = Field(None, alias="sandboxResult")
    final_result: Optional[dict[str, Any]] = Field(None, alias="finalResult")
    error: Optional[str] = None
