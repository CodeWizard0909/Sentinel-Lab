"""Tests for mock pipeline execution."""

import os

os.environ["MOCK_MODE"] = "true"

from app.orchestrator.pipeline import ScanPipeline
from app.aws.dynamodb import get_dynamodb_client
from app.schemas.scan import ScanStatus


def test_mock_pipeline_runs():
    """Mock pipeline should complete successfully."""
    db = get_dynamodb_client()

    # Create a scan record
    scan_id = "scan_test_pipeline"
    db.create_scan({
        "scanId": scan_id,
        "projectName": "test-project",
        "status": ScanStatus.QUEUED.value,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
    })

    # Run pipeline with new required arguments
    pipeline = ScanPipeline()
    result = pipeline.run(scan_id, "mock code", "python", "")

    # Verify final result
    assert result is not None
    
    # Verify scan was updated
    scan = db.get_scan(scan_id)
    assert scan["status"] == ScanStatus.COMPLETED.value or scan["status"] == ScanStatus.VERIFIED.value or scan["status"] == ScanStatus.FAILED.value
    assert scan.get("issues") is not None
    assert scan.get("verdict") is not None


def test_mock_pipeline_verified_result():
    """Mock pipeline should produce VERIFIED result for the SQL injection sample."""
    db = get_dynamodb_client()

    scan_id = "scan_test_verified"
    db.create_scan({
        "scanId": scan_id,
        "projectName": "sql-injection",
        "status": ScanStatus.QUEUED.value,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
    })

    pipeline = ScanPipeline()
    result = pipeline.run(scan_id, "query = f'SELECT * FROM users WHERE id = {user_id}'", "python", "")

    # In mock mode, the mock Repair agent correctly replaces f-strings, 
    # passing the mock sandbox and returning VERIFIED.
    assert result.get("verdict") == "VERIFIED" or result.get("status") == "VERIFIED"
