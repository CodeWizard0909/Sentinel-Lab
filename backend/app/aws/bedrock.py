"""Bedrock model client — abstraction for AI model invocation.

Supports per-agent model configuration. In mock mode, returns
deterministic test data without calling AWS.
"""

import json
import logging
from typing import Any, Optional

import boto3
from pydantic import BaseModel

from app.config import get_settings

logger = logging.getLogger(__name__)


class ModelClient:
    """Abstraction over Amazon Bedrock model invocation."""

    def __init__(self, model_id: Optional[str] = None):
        settings = get_settings()
        self.model_id = model_id or settings.analyzer_model_id
        self.mock_mode = settings.mock_mode

        if not self.mock_mode:
            self.client = boto3.client(
                "bedrock-runtime",
                region_name=settings.aws_region,
            )
        else:
            self.client = None

    def invoke(self, prompt: str, system_prompt: str = "", max_tokens: int = 4096) -> str:
        """Invoke model and return raw text response."""
        if self.mock_mode:
            logger.info(f"[MOCK] Bedrock invoke: {prompt[:80]}...")
            return '{"mock": true}'

        messages = [{"role": "user", "content": [{"type": "text", "text": prompt}]}]

        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "messages": messages,
        }

        if system_prompt:
            body["system"] = system_prompt

        response = self.client.invoke_model(
            modelId=self.model_id,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(body),
        )

        result = json.loads(response["body"].read())
        return result["content"][0]["text"]

    def invoke_json(self, prompt: str, system_prompt: str = "", max_tokens: int = 4096) -> dict[str, Any]:
        """Invoke model and parse response as JSON."""
        raw = self.invoke(prompt, system_prompt, max_tokens)

        # Try to extract JSON from response
        try:
            # Handle cases where model wraps JSON in markdown code blocks
            text = raw.strip()
            if text.startswith("```"):
                lines = text.split("\n")
                # Remove first and last lines (``` markers)
                text = "\n".join(lines[1:-1])
            return json.loads(text)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse model response as JSON: {raw[:200]}")
            raise ValueError(f"Model did not return valid JSON: {raw[:200]}")


def get_bedrock_client(model_id: Optional[str] = None) -> ModelClient:
    """Factory for ModelClient instances."""
    return ModelClient(model_id=model_id)
