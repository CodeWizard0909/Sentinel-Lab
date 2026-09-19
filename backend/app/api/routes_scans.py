"""Scan endpoints — create, start, get status."""

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.schemas.scan import ScanCreate, ScanResponse, ScanDetail, ScanStatus
from app.aws.s3 import get_s3_client
from app.aws.dynamodb import get_dynamodb_client
from app.aws.lambda_client import get_lambda_client

router = APIRouter()


@router.post("", response_model=ScanResponse)
async def create_scan(body: ScanCreate):
    """Create a new scan and return an S3 presigned upload URL."""
    settings = get_settings()
    scan_id = f"scan_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()

    # Generate presigned upload URL
    s3 = get_s3_client()
    s3_key = f"projects/{scan_id}/source.zip"
    upload_url = s3.generate_presigned_url(s3_key)

    # Store scan record
    db = get_dynamodb_client()
    db.create_scan({
        "scanId": scan_id,
        "projectName": body.project_name,
        "status": ScanStatus.QUEUED.value,
        "createdAt": now,
        "updatedAt": now,
        "s3Key": s3_key,
    })

    return ScanResponse(
        scan_id=scan_id,
        project_name=body.project_name,
        upload_url=upload_url,
        status=ScanStatus.QUEUED,
    )


@router.post("/{scan_id}/start")
async def start_scan(scan_id: str):
    """Start processing a scan asynchronously."""
    db = get_dynamodb_client()
    scan = db.get_scan(scan_id)

    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    if scan.get("status") != ScanStatus.QUEUED.value:
        raise HTTPException(status_code=400, detail=f"Scan is already {scan.get('status')}")

    # Update status
    db.update_status(scan_id, ScanStatus.ANALYZING.value)

    # Invoke worker asynchronously
    settings = get_settings()
    if settings.mock_mode:
        # In mock mode, run pipeline directly (async simulation)
        from app.mock.pipeline import run_mock_pipeline
        import asyncio
        asyncio.create_task(run_mock_pipeline(scan_id))
    else:
        lambda_client = get_lambda_client()
        lambda_client.invoke_worker(scan_id)

    return {"scanId": scan_id, "status": ScanStatus.ANALYZING.value}


@router.get("/{scan_id}", response_model=ScanDetail)
async def get_scan(scan_id: str):
    """Get current scan state and results."""
    db = get_dynamodb_client()
    scan = db.get_scan(scan_id)

    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    return ScanDetail(
        scan_id=scan.get("scanId", scan_id),
        project_name=scan.get("projectName", ""),
        status=scan.get("status", ScanStatus.QUEUED.value),
        created_at=scan.get("createdAt", ""),
        updated_at=scan.get("updatedAt", ""),
        issues=scan.get("issues"),
        repairs=scan.get("repairs"),
        sandbox_result=scan.get("sandboxResult"),
        final_result=scan.get("finalResult"),
        error=scan.get("error"),
    )
