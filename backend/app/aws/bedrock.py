"""Bedrock model client — Singleton client using Converse API."""

import os
import re
import json
import logging
from typing import Any, Optional

import boto3
import botocore.exceptions
from app.config import get_settings

logger = logging.getLogger(__name__)

# Module-level singleton
_client = None

def get_boto_client():
    global _client
    if _client is None:
        settings = get_settings()
        if not settings.mock_mode:
            _client = boto3.client("bedrock-runtime", region_name=settings.aws_region)
    return _client


def _strip_markdown_fences(text: str) -> str:
    """Robust regex-based markdown fence stripping."""
    match = re.search(r"```(?:json|JSON)?\s*\n([\s\S]*?)\n```", text)
    if match:
        return match.group(1).strip()
    return text.strip()


class ModelClient:
    """Modern Bedrock client using Converse API."""
    def __init__(self, model_id: Optional[str] = None):
        settings = get_settings()
        self.model_id = model_id or settings.analyzer_model_id
        self.mock_mode = settings.mock_mode
        self.client = get_boto_client()

    def invoke_json(self, prompt: str, system_prompt: str = "", max_tokens: int = 4096, temperature: float = 0.1) -> dict[str, Any]:
        """Invoke using Converse API and return JSON."""
        if self.mock_mode:
            logger.info(f"[MOCK] Bedrock invoke: {prompt[:80]}...")
            return {}

        messages = [{"role": "user", "content": [{"text": prompt}]}]
        system = [{"text": system_prompt}] if system_prompt else []

        try:
            response = self.client.converse(
                modelId=self.model_id,
                system=system,
                messages=messages,
                inferenceConfig={"maxTokens": max_tokens, "temperature": temperature}
            )
            raw_text = response["output"]["message"]["content"][0]["text"]
            clean_text = _strip_markdown_fences(raw_text)
            return json.loads(clean_text)

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
            raise ValueError(f"Model returned invalid JSON: {e}")
        except botocore.exceptions.ClientError as e:
            error_code = e.response["Error"]["Code"]
            if error_code == "ThrottlingException":
                raise RuntimeError("Bedrock API rate limit hit.")
            raise RuntimeError(f"Bedrock API error: {e}")


def get_bedrock_client(model_id: Optional[str] = None) -> ModelClient:
    return ModelClient(model_id=model_id)
