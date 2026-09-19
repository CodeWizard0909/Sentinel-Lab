"""SentinelLab backend configuration.

All settings loaded from environment variables with sensible defaults.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # --- Mode ---
    mock_mode: bool = False

    # --- AWS ---
    aws_region: str = "us-east-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""

    # --- S3 ---
    s3_bucket_name: str = "sentinellab-projects"

    # --- DynamoDB ---
    dynamodb_table_name: str = "SentinelLabScans"

    # --- Bedrock Model IDs ---
    analyzer_model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0"
    security_model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0"
    repair_model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0"
    judge_model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0"

    # --- AgentCore ---
    agentcore_sandbox_id: str = ""

    # --- Worker Lambda ---
    worker_lambda_name: str = "sentinellab-worker"

    # --- API ---
    api_host: str = "0.0.0.0"
    api_port: int = 8000


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
