import uuid
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.schemas.scan import ScanCreate, ScanResponse, ScanDetail, ScanStatus
from app.aws.dynamodb import get_dynamodb_client
from app.aws.lambda_client import get_lambda_client
from app.orchestrator.pipeline import ScanPipeline

router = APIRouter()


@router.post("", response_model=ScanResponse)
async def create_scan(body: ScanCreate):
    """Create a new scan and start it immediately."""
    scan_id = f"scan_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()

    # Store scan record
    db = get_dynamodb_client()
    db.create_scan({
        "scanId": scan_id,
        "projectName": body.project_name,
        "status": ScanStatus.QUEUED.value,
        "createdAt": now,
        "updatedAt": now,
    })

    # Trigger the pipeline worker asynchronously via AWS Lambda Event
    settings = get_settings()
    if settings.mock_mode:
        # Local mock mode simulation
        pipeline = ScanPipeline()
        asyncio.create_task(asyncio.to_thread(pipeline.run, scan_id, body.code, body.language, body.test_code))
    else:
        # Real AWS Lambda invocation
        lambda_client = get_lambda_client()
        lambda_client.invoke_worker(scan_id, body.code, body.language, body.test_code)

    return ScanResponse(
        scan_id=scan_id,
        project_name=body.project_name,
        status=ScanStatus.QUEUED,
    )


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
        completed_at=scan.get("completedAt"),
        issues=scan.get("issues", []),
        repairs=scan.get("repairs", []),
        baseline_sandbox=scan.get("baseline_sandbox"),
        repaired_sandbox=scan.get("repaired_sandbox"),
        verdict=scan.get("verdict"),
        error=scan.get("error"),
    )
