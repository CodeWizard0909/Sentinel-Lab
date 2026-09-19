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

    # Run pipeline
    pipeline = ScanPipeline()
    result = pipeline.run(scan_id)

    # Verify final result
    assert result is not None
    assert result["status"] in ["VERIFIED", "FAILED", "INCONCLUSIVE"]

    # Verify scan was updated
    scan = db.get_scan(scan_id)
    assert scan["status"] == ScanStatus.COMPLETED.value
    assert scan.get("issues") is not None
    assert scan.get("repairs") is not None
    assert scan.get("sandboxResult") is not None
    assert scan.get("finalResult") is not None


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
    result = pipeline.run(scan_id)

    assert result["status"] == "VERIFIED"
    assert result["issuesFound"] > 0
    assert result["testsFailed"] == 0
    assert result["securityPassed"] is True
