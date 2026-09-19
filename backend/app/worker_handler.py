"""Worker Lambda handler — entry point for async scan processing.

Invoked by the API Lambda when a scan is started.
Receives a scanId and runs the complete pipeline.
"""

import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def handler(event, context):
    """Lambda handler for scan processing.

    Args:
        event: {"scanId": "scan_xxx"} or API Gateway event with body
        context: Lambda context

    Returns:
        dict with statusCode and body
    """
    logger.info(f"Worker invoked with event: {json.dumps(event)}")

    # Extract payload
    scan_id = event.get("scanId")
    code = event.get("code", "")
    language = event.get("language", "python")
    test_code = event.get("test_code", "")

    if not scan_id and "body" in event:
        body = json.loads(event["body"])
        scan_id = body.get("scanId")
        code = body.get("code", "")
        language = body.get("language", "python")
        test_code = body.get("test_code", "")

    if not scan_id:
        logger.error("No scanId in event")
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing scanId"}),
        }

    try:
        from app.orchestrator.pipeline import ScanPipeline

        pipeline = ScanPipeline()
        result = pipeline.run(scan_id, code, language, test_code)

        return {
            "statusCode": 200,
            "body": json.dumps({"scanId": scan_id, "status": "COMPLETED"}),
        }

    except Exception as e:
        logger.error(f"Worker failed for scan {scan_id}: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e), "scanId": scan_id}),
        }
