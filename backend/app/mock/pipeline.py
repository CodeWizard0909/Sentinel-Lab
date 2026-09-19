"""Mock pipeline — runs the scan pipeline with simulated delays.

Used when MOCK_MODE=true for frontend development and demos
without requiring real AWS services.
"""

import asyncio
import logging

from app.orchestrator.pipeline import ScanPipeline

logger = logging.getLogger(__name__)


async def run_mock_pipeline(scan_id: str) -> None:
    """Run the scan pipeline asynchronously with simulated delays.

    This is called from the /scans/{scanId}/start endpoint
    when MOCK_MODE=true instead of invoking a Lambda worker.
    """
    logger.info(f"[MOCK] Starting mock pipeline for {scan_id}")

    # Small delay to simulate async processing
    await asyncio.sleep(0.5)

    try:
        pipeline = ScanPipeline()
        pipeline.run(scan_id)
        logger.info(f"[MOCK] Pipeline completed for {scan_id}")
    except Exception as e:
        logger.error(f"[MOCK] Pipeline failed for {scan_id}: {e}")
