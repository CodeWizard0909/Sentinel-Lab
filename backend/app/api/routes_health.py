"""Health check endpoint with live AWS status detection."""

from fastapi import APIRouter
from app.config import get_settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """Return service health and AWS connectivity status."""
    settings = get_settings()

    aws_connected = False
    if not settings.mock_mode:
        try:
            import boto3
            session = boto3.Session(
                aws_access_key_id=getattr(settings, "aws_access_key_id", None),
                aws_secret_access_key=getattr(settings, "aws_secret_access_key", None),
                region_name=settings.aws_region
            )
            # Lightweight check
            sts = session.client("sts")
            identity = sts.get_caller_identity()
            aws_connected = bool(identity.get("Account"))
        except Exception:
            aws_connected = False

    return {
        "status": "ok",
        "mode": "mock" if settings.mock_mode else "live",
        "aws_connected": aws_connected,
        "region": settings.aws_region,
        "dynamodb_table": settings.dynamodb_table_name,
        "s3_bucket": settings.s3_bucket_name,
        "bedrock_model": settings.analyzer_model_id,
    }
