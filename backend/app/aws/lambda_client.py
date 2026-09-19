"""Lambda client — async invocation of the worker Lambda.

In mock mode, logs the invocation without calling AWS.
"""

import json
import logging
from functools import lru_cache

import boto3

from app.config import get_settings

logger = logging.getLogger(__name__)


class LambdaClient:
    """Abstraction for invoking the worker Lambda."""

    def __init__(self):
        settings = get_settings()
        self.function_name = settings.worker_lambda_name
        self.mock_mode = settings.mock_mode

        if not self.mock_mode:
            self.client = boto3.client("lambda", region_name=settings.aws_region)
        else:
            self.client = None

    def invoke_worker(self, scan_id: str) -> None:
        """Invoke the worker Lambda asynchronously."""
        payload = {"scanId": scan_id}

        if self.mock_mode:
            logger.info(f"[MOCK] Lambda invoke: {self.function_name} with {payload}")
            return

        self.client.invoke(
            FunctionName=self.function_name,
            InvocationType="Event",  # Async invocation
            Payload=json.dumps(payload),
        )
        logger.info(f"Worker Lambda invoked for scan {scan_id}")


@lru_cache()
def get_lambda_client() -> LambdaClient:
    """Singleton Lambda client."""
    return LambdaClient()
