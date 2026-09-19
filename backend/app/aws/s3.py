"""S3 client — project upload/download and presigned URL generation.

In mock mode, uses in-memory storage.
"""

import logging
from typing import Optional
from functools import lru_cache

import boto3

from app.config import get_settings

logger = logging.getLogger(__name__)

# In-memory store for mock mode
_mock_storage: dict[str, bytes] = {}


class S3Client:
    """Abstraction over Amazon S3."""

    def __init__(self):
        settings = get_settings()
        self.bucket = settings.s3_bucket_name
        self.mock_mode = settings.mock_mode

        if not self.mock_mode:
            self.client = boto3.client("s3", region_name=settings.aws_region)
        else:
            self.client = None

    def generate_presigned_url(self, key: str, expires_in: int = 3600) -> str:
        """Generate a presigned PUT URL for uploading."""
        if self.mock_mode:
            return f"http://localhost:8000/mock-upload/{key}"

        return self.client.generate_presigned_url(
            "put_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=expires_in,
        )

    def upload_bytes(self, key: str, data: bytes) -> None:
        """Upload raw bytes to S3."""
        if self.mock_mode:
            _mock_storage[key] = data
            logger.info(f"[MOCK] S3 upload: {key} ({len(data)} bytes)")
            return

        self.client.put_object(Bucket=self.bucket, Key=key, Body=data)

    def download_bytes(self, key: str) -> Optional[bytes]:
        """Download raw bytes from S3."""
        if self.mock_mode:
            return _mock_storage.get(key)

        try:
            response = self.client.get_object(Bucket=self.bucket, Key=key)
            return response["Body"].read()
        except self.client.exceptions.NoSuchKey:
            return None

    def get_project_files(self, scan_id: str) -> dict[str, str]:
        """Download and return project source files as a dict of filename -> content."""
        if self.mock_mode:
            # Return sample project files in mock mode
            return {
                "app.py": 'import sqlite3\n\ndef get_user(username):\n    conn = sqlite3.connect("users.db")\n    cursor = conn.cursor()\n    query = f"SELECT * FROM users WHERE username = \'{username}\'"\n    cursor.execute(query)\n    return cursor.fetchone()\n',
                "test_app.py": 'from app import get_user\n\ndef test_normal_user():\n    result = get_user("alice")\n    # Basic test\n\ndef test_sql_injection():\n    result = get_user("\' OR 1=1 --")\n    # This should not return all users\n',
            }

        # Real S3: list objects under projects/{scan_id}/
        prefix = f"projects/{scan_id}/"
        response = self.client.list_objects_v2(Bucket=self.bucket, Prefix=prefix)
        files = {}
        for obj in response.get("Contents", []):
            key = obj["Key"]
            filename = key.replace(prefix, "")
            data = self.download_bytes(key)
            if data:
                files[filename] = data.decode("utf-8", errors="replace")
        return files


@lru_cache()
def get_s3_client() -> S3Client:
    """Singleton S3 client."""
    return S3Client()
