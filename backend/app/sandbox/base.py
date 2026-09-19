"""Sandbox executor interface — abstract base for code execution."""

from abc import ABC, abstractmethod
from app.schemas.sandbox import SandboxRequest, SandboxResult


class SandboxExecutor(ABC):
    """Abstract sandbox executor.

    All sandbox implementations must extend this interface.
    The application depends on this abstraction, not on any specific provider.
    """

    @abstractmethod
    def run(self, request: SandboxRequest) -> SandboxResult:
        """Execute code in an isolated sandbox.

        Args:
            request: SandboxRequest with code, tests, and config

        Returns:
            SandboxResult with execution outcome and evidence
        """
        ...
