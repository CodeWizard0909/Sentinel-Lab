"""DynamoDB client — scan record CRUD.

In mock mode, uses in-memory dict storage.
"""

import logging
from typing import Any, Optional
from datetime import datetime, timezone
from functools import lru_cache

import boto3

from app.config import get_settings

logger = logging.getLogger(__name__)

# In-memory store for mock mode
_mock_db: dict[str, dict[str, Any]] = {}


class DynamoDBClient:
    """Abstraction over DynamoDB for scan records."""

    def __init__(self):
        settings = get_settings()
        self.table_name = settings.dynamodb_table_name
        self.mock_mode = settings.mock_mode

        if not self.mock_mode:
            dynamodb = boto3.resource("dynamodb", region_name=settings.aws_region)
            self.table = dynamodb.Table(self.table_name)
        else:
            self.table = None

    def create_scan(self, scan: dict[str, Any]) -> None:
        """Create a new scan record."""
        if self.mock_mode:
            _mock_db[scan["scanId"]] = scan
            logger.info(f"[MOCK] DynamoDB create: {scan['scanId']}")
            return

        self.table.put_item(Item=scan)

    def get_scan(self, scan_id: str) -> Optional[dict[str, Any]]:
        """Get a scan record by ID."""
        if self.mock_mode:
            return _mock_db.get(scan_id)

        response = self.table.get_item(Key={"scanId": scan_id})
        return response.get("Item")

    def update_scan(self, scan_id: str, updates: dict[str, Any]) -> None:
        """Update specific fields on a scan record."""
        now = datetime.now(timezone.utc).isoformat()
        updates["updatedAt"] = now

        if self.mock_mode:
            if scan_id in _mock_db:
                _mock_db[scan_id].update(updates)
            logger.info(f"[MOCK] DynamoDB update: {scan_id} -> {list(updates.keys())}")
            return

        # Build update expression
        expr_parts = []
        expr_values = {}
        expr_names = {}
        for i, (key, val) in enumerate(updates.items()):
            attr_name = f"#attr{i}"
            attr_val = f":val{i}"
            expr_parts.append(f"{attr_name} = {attr_val}")
            expr_names[attr_name] = key
            expr_values[attr_val] = val

        self.table.update_item(
            Key={"scanId": scan_id},
            UpdateExpression="SET " + ", ".join(expr_parts),
            ExpressionAttributeNames=expr_names,
            ExpressionAttributeValues=expr_values,
        )

    def update_status(self, scan_id: str, status: str) -> None:
        """Convenience: update just the status field."""
        self.update_scan(scan_id, {"status": status})


@lru_cache()
def get_dynamodb_client() -> DynamoDBClient:
    """Singleton DynamoDB client."""
    return DynamoDBClient()
