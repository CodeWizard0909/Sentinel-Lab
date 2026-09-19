"""Base agent interface — all agents must extend this."""

from abc import ABC, abstractmethod
from typing import Any
import logging

from app.aws.bedrock import ModelClient, get_bedrock_client

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """Abstract base for all SentinelLab agents.

    Each agent:
    - Receives structured input
    - Uses a Bedrock model (or mock) for reasoning
    - Returns structured JSON output validated by Pydantic
    """

    def __init__(self, model_id: str | None = None):
        self.model_client: ModelClient = get_bedrock_client(model_id)
        self.name: str = self.__class__.__name__

    @abstractmethod
    def run(self, **kwargs: Any) -> dict[str, Any]:
        """Execute the agent's task and return structured output.

        Returns:
            dict: Agent-specific structured result.
        """
        ...

    def _log(self, message: str) -> None:
        """Log with agent name prefix."""
        logger.info(f"[{self.name}] {message}")
